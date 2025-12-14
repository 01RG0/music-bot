// Core Discord entities
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

// Music related types
export interface Track {
  track: string; // Lavalink encoded track
  info: {
    identifier: string;
    isSeekable: boolean;
    author: string;
    length: number;
    isStream: boolean;
    position: number;
    title: string;
    uri: string;
    artworkUrl?: string;
    isrc?: string;
    sourceName: string;
  };
  requester: string; // Discord user ID
  requestedAt: Date;
}

export interface Queue {
  guildId: string;
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isLooping: 'off' | 'track' | 'queue';
  volume: number;
  filters: AudioFilters;
  autoplay: boolean;
  voiceChannelId?: string;
  textChannelId?: string;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioFilters {
  bassboost?: number;
  nightcore?: boolean;
  vaporwave?: boolean;
  '8d'?: boolean;
  karaoke?: boolean;
  tremolo?: boolean;
  vibrato?: boolean;
  rotation?: boolean;
  distortion?: boolean;
  lowpass?: boolean;
  channelmix?: boolean;
  timescale?: boolean;
}

// Database models
export interface GuildSettings {
  guildId: string;
  prefix: string;
  djRoleId?: string;
  defaultVolume: number;
  maxQueueLength: number;
  maxSongDuration: number;
  allowDuplicates: boolean;
  autoplay: boolean;
  announceSongs: boolean;
  permissions: {
    play: string[]; // Role IDs
    skip: string[];
    stop: string[];
    clear: string[];
    shuffle: string[];
    volume: string[];
    filters: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  discordId: string;
  username: string;
  discriminator: string;
  avatar?: string;
  guilds: string[]; // Guild IDs where user has access
  favorites: string[]; // Track IDs
  playlists: string[]; // Playlist IDs
  stats: {
    songsPlayed: number;
    timeListened: number; // in milliseconds
    commandsUsed: number;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Playlist {
  _id?: string;
  name: string;
  description?: string;
  userId: string; // Discord user ID
  tracks: Track[];
  isPublic: boolean;
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  userId: string;
  track: Track;
  addedAt: Date;
}

export interface Stats {
  guildId: string;
  totalTracksPlayed: number;
  totalListeningTime: number; // in milliseconds
  mostPlayedTracks: Array<{
    track: Track;
    playCount: number;
  }>;
  activeUsers: Array<{
    userId: string;
    tracksPlayed: number;
    timeListened: number;
  }>;
  peakConcurrentUsers: number;
  averageSessionLength: number; // in milliseconds
  commandsUsed: Record<string, number>;
  updatedAt: Date;
}

// API and WebSocket types
export interface PlayerState {
  guildId: string;
  currentTrack?: Track;
  queue: Track[];
  isPlaying: boolean;
  isPaused: boolean;
  position: number;
  volume: number;
  loop: 'off' | 'track' | 'queue';
  filters: AudioFilters;
  autoplay: boolean;
}

export interface WebSocketEvents {
  // Player events
  'player:play': (data: { guildId: string; track: Track }) => void;
  'player:pause': (data: { guildId: string }) => void;
  'player:resume': (data: { guildId: string }) => void;
  'player:skip': (data: { guildId: string; skippedTrack?: Track }) => void;
  'player:stop': (data: { guildId: string }) => void;
  'player:volume': (data: { guildId: string; volume: number }) => void;
  'player:seek': (data: { guildId: string; position: number }) => void;
  'player:filters': (data: { guildId: string; filters: AudioFilters }) => void;

  // Queue events
  'queue:update': (data: { guildId: string; queue: Track[] }) => void;
  'queue:add': (data: { guildId: string; tracks: Track[] }) => void;
  'queue:remove': (data: { guildId: string; index: number; removedTrack: Track }) => void;
  'queue:clear': (data: { guildId: string }) => void;
  'queue:shuffle': (data: { guildId: string; newQueue: Track[] }) => void;
  'queue:move': (data: { guildId: string; from: number; to: number; queue: Track[] }) => void;

  // Track events
  'track:start': (data: { guildId: string; track: Track }) => void;
  'track:end': (data: { guildId: string; track: Track; reason: string }) => void;
  'track:stuck': (data: { guildId: string; track: Track }) => void;
  'track:error': (data: { guildId: string; track: Track; error: string }) => void;

  // Voice events
  'voice:join': (data: { guildId: string; channelId: string }) => void;
  'voice:leave': (data: { guildId: string; channelId: string }) => void;
  'voice:error': (data: { guildId: string; error: string }) => void;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  guilds: Array<{
    id: string;
    name: string;
    icon?: string;
    owner: boolean;
    permissions: string;
    hasBot: boolean;
  }>;
}

// Filter presets
export const FILTER_PRESETS = {
  bassboost: {
    bassboost: 0.5
  },
  nightcore: {
    nightcore: true
  },
  vaporwave: {
    vaporwave: true
  },
  '8d': {
    '8d': true
  },
  reset: {}
} as const;

export type FilterPreset = keyof typeof FILTER_PRESETS;
