import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { MoonlinkTrack } from 'moonlink.js';
import {
  Track,
  Queue,
  PlayerState
} from '@types/index';
import {
  QueueModel,
  GuildSettingsModel,
  StatsModel
} from '@utils/schemas';

export class QueueManager extends EventEmitter {
  private socketClient?: Socket;
  private queues: Map<string, Queue> = new Map();

  constructor(socketUrl?: string) {
    super();

    if (socketUrl) {
      this.connectSocket(socketUrl);
    }
  }

  private connectSocket(url: string): void {
    this.socketClient = io(url, {
      transports: ['websocket'],
      auth: {
        token: process.env.WS_AUTH_TOKEN
      }
    });

    this.socketClient.on('connect', () => {
      console.log('🔗 QueueManager connected to WebSocket server');
    });

    this.socketClient.on('disconnect', () => {
      console.log('🔌 QueueManager disconnected from WebSocket server');
    });
  }

  private emitToSocket(event: string, data: any): void {
    if (this.socketClient?.connected) {
      this.socketClient.emit(event, data);
    }
  }

  // Load queue from database
  async loadQueue(guildId: string): Promise<Queue | null> {
    try {
      let queue = await QueueModel.findOne({ guildId });

      if (!queue) {
        // Create new queue
        queue = new QueueModel({
          guildId,
          tracks: [],
          currentIndex: 0,
          isPlaying: false,
          isPaused: false,
          isLooping: 'off',
          volume: 100,
          filters: {},
          autoplay: true
        });
        await queue.save();
      }

      // Cache in memory
      this.queues.set(guildId, queue.toObject());

      return queue.toObject();
    } catch (error) {
      console.error(`Failed to load queue for guild ${guildId}:`, error);
      return null;
    }
  }

  // Save queue to database
  private async saveQueue(guildId: string, updates: Partial<Queue>): Promise<void> {
    try {
      await QueueModel.updateOne(
        { guildId },
        { ...updates, updatedAt: new Date() },
        { upsert: true }
      );

      // Update cache
      const cached = this.queues.get(guildId);
      if (cached) {
        Object.assign(cached, updates);
      }
    } catch (error) {
      console.error(`Failed to save queue for guild ${guildId}:`, error);
      throw error;
    }
  }

  // Add tracks to queue
  async addTracks(guildId: string, tracks: Track[], position?: number): Promise<void> {
    const queue = await this.loadQueue(guildId);
    if (!queue) return;

    // Check guild settings
    const settings = await GuildSettingsModel.findOne({ guildId });
    const maxLength = settings?.maxQueueLength || 1000;

    if (queue.tracks.length + tracks.length > maxLength) {
      throw new Error(`Queue would exceed maximum length of ${maxLength} tracks`);
    }

    // Check for duplicates if not allowed
    if (!settings?.allowDuplicates) {
      const existingIdentifiers = new Set(queue.tracks.map(t => t.info.identifier));
      tracks = tracks.filter(track => !existingIdentifiers.has(track.info.identifier));
    }

    // Add tracks at specified position or end
    if (position !== undefined) {
      queue.tracks.splice(position, 0, ...tracks);
    } else {
      queue.tracks.push(...tracks);
    }

    await this.saveQueue(guildId, { tracks: queue.tracks });

    this.emitToSocket('queue:add', { guildId, tracks });
    this.emitToSocket('queue:update', { guildId, queue: queue.tracks });
  }

  // Remove track from queue
  async removeTrack(guildId: string, index: number): Promise<Track | null> {
    const queue = await this.loadQueue(guildId);
    if (!queue || index < 0 || index >= queue.tracks.length) {
      return null;
    }

    const removedTrack = queue.tracks.splice(index, 1)[0];

    // Adjust current index if necessary
    if (index < queue.currentIndex) {
      queue.currentIndex = Math.max(0, queue.currentIndex - 1);
    } else if (index === queue.currentIndex && queue.tracks.length === 0) {
      queue.currentIndex = 0;
      queue.isPlaying = false;
    }

    await this.saveQueue(guildId, {
      tracks: queue.tracks,
      currentIndex: queue.currentIndex,
      isPlaying: queue.isPlaying
    });

    this.emitToSocket('queue:remove', { guildId, index, removedTrack });
    this.emitToSocket('queue:update', { guildId, queue: queue.tracks });

    return removedTrack;
  }

  // Move track in queue
  async moveTrack(guildId: string, from: number, to: number): Promise<void> {
    const queue = await this.loadQueue(guildId);
    if (!queue || from < 0 || from >= queue.tracks.length || to < 0 || to >= queue.tracks.length) {
      throw new Error('Invalid track positions');
    }

    const track = queue.tracks.splice(from, 1)[0];
    queue.tracks.splice(to, 0, track);

    // Adjust current index if necessary
    if (from === queue.currentIndex) {
      queue.currentIndex = to;
    } else if (from < queue.currentIndex && to >= queue.currentIndex) {
      queue.currentIndex--;
    } else if (from > queue.currentIndex && to <= queue.currentIndex) {
      queue.currentIndex++;
    }

    await this.saveQueue(guildId, {
      tracks: queue.tracks,
      currentIndex: queue.currentIndex
    });

    this.emitToSocket('queue:move', { guildId, from, to, queue: queue.tracks });
    this.emitToSocket('queue:update', { guildId, queue: queue.tracks });
  }

  // Clear queue
  async clearQueue(guildId: string): Promise<void> {
    await this.saveQueue(guildId, {
      tracks: [],
      currentIndex: 0,
      isPlaying: false,
      isPaused: false
    });

    this.emitToSocket('queue:clear', { guildId });
    this.emitToSocket('queue:update', { guildId, queue: [] });
  }

  // Shuffle queue
  async shuffleQueue(guildId: string): Promise<void> {
    const queue = await this.loadQueue(guildId);
    if (!queue || queue.tracks.length <= 1) return;

    // Don't shuffle the currently playing track
    const currentTrack = queue.tracks[queue.currentIndex];
    const remainingTracks = queue.tracks.slice(queue.currentIndex + 1);

    // Shuffle remaining tracks
    for (let i = remainingTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingTracks[i], remainingTracks[j]] = [remainingTracks[j], remainingTracks[i]];
    }

    // Reconstruct queue
    queue.tracks = [currentTrack, ...remainingTracks];

    await this.saveQueue(guildId, { tracks: queue.tracks });

    this.emitToSocket('queue:shuffle', { guildId, newQueue: queue.tracks });
    this.emitToSocket('queue:update', { guildId, queue: queue.tracks });
  }

  // Get current track
  async getCurrentTrack(guildId: string): Promise<Track | null> {
    const queue = await this.loadQueue(guildId);
    if (!queue || queue.currentIndex >= queue.tracks.length) {
      return null;
    }

    return queue.tracks[queue.currentIndex];
  }

  // Get next tracks
  async getNextTracks(guildId: string, limit: number = 10): Promise<Track[]> {
    const queue = await this.loadQueue(guildId);
    if (!queue) return [];

    const startIndex = queue.currentIndex + 1;
    return queue.tracks.slice(startIndex, startIndex + limit);
  }

  // Get queue info
  async getQueueInfo(guildId: string): Promise<Queue | null> {
    return await this.loadQueue(guildId);
  }

  // Set loop mode
  async setLoopMode(guildId: string, mode: 'off' | 'track' | 'queue'): Promise<void> {
    await this.saveQueue(guildId, { isLooping: mode });
    // Note: PlayerManager handles the actual looping logic
  }

  // Set autoplay
  async setAutoplay(guildId: string, enabled: boolean): Promise<void> {
    await this.saveQueue(guildId, { autoplay: enabled });
  }

  // Search and add tracks
  async searchAndAdd(
    guildId: string,
    query: string,
    requester: string,
    searchFunction: (query: string) => Promise<MoonlinkTrack[]>
  ): Promise<Track[]> {
    try {
      const results = await searchFunction(query);
      if (results.length === 0) {
        throw new Error('No tracks found');
      }

      // Convert to our Track format
      const tracks: Track[] = results.map(track => ({
        track: track.track,
        info: {
          identifier: track.identifier,
          isSeekable: track.isSeekable,
          author: track.author,
          length: track.duration,
          isStream: track.isStream,
          position: track.position || 0,
          title: track.title,
          uri: track.url,
          artworkUrl: track.artworkUrl,
          isrc: track.isrc,
          sourceName: track.sourceName
        },
        requester,
        requestedAt: new Date()
      }));

      await this.addTracks(guildId, tracks);
      return tracks;
    } catch (error) {
      console.error('Search and add failed:', error);
      throw error;
    }
  }

  // Get player state (for WebSocket sync)
  async getPlayerState(guildId: string): Promise<PlayerState | null> {
    const queue = await this.loadQueue(guildId);
    if (!queue) return null;

    const currentTrack = queue.currentIndex < queue.tracks.length
      ? queue.tracks[queue.currentIndex]
      : null;

    return {
      guildId,
      currentTrack: currentTrack || undefined,
      queue: queue.tracks,
      isPlaying: queue.isPlaying,
      isPaused: queue.isPaused,
      position: 0, // This would come from PlayerManager
      volume: queue.volume,
      loop: queue.isLooping,
      filters: queue.filters,
      autoplay: queue.autoplay
    };
  }

  // Clean up old queues (called by cron job)
  async cleanupOldQueues(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const result = await QueueModel.deleteMany({
        lastActivity: { $lt: cutoffDate },
        isPlaying: false
      });

      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old queues`);
      }
    } catch (error) {
      console.error('Failed to cleanup old queues:', error);
    }
  }
}
