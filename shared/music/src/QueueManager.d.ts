import { EventEmitter } from 'events';
import { MoonlinkTrack } from 'moonlink.js';
import { Track, Queue, PlayerState } from '@types/index';
export declare class QueueManager extends EventEmitter {
    private socketClient?;
    private queues;
    constructor(socketUrl?: string);
    private connectSocket;
    private emitToSocket;
    loadQueue(guildId: string): Promise<Queue | null>;
    private saveQueue;
    addTracks(guildId: string, tracks: Track[], position?: number): Promise<void>;
    removeTrack(guildId: string, index: number): Promise<Track | null>;
    moveTrack(guildId: string, from: number, to: number): Promise<void>;
    clearQueue(guildId: string): Promise<void>;
    shuffleQueue(guildId: string): Promise<void>;
    getCurrentTrack(guildId: string): Promise<Track | null>;
    getNextTracks(guildId: string, limit?: number): Promise<Track[]>;
    getQueueInfo(guildId: string): Promise<Queue | null>;
    setLoopMode(guildId: string, mode: 'off' | 'track' | 'queue'): Promise<void>;
    setAutoplay(guildId: string, enabled: boolean): Promise<void>;
    setPlayingStatus(guildId: string, isPlaying: boolean): Promise<void>;
    searchAndAdd(guildId: string, query: string, requester: string, searchFunction: (query: string) => Promise<MoonlinkTrack[]>): Promise<Track[]>;
    getPlayerState(guildId: string): Promise<PlayerState | null>;
    cleanupOldQueues(): Promise<void>;
}
//# sourceMappingURL=QueueManager.d.ts.map