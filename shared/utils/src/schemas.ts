import mongoose, { Schema, Document } from 'mongoose';
import {
  Track,
  Queue,
  GuildSettings,
  User,
  Playlist,
  Favorite,
  Stats,
  AudioFilters
} from '@types/index';

// Track Schema
const TrackSchema = new Schema<Track>({
  track: { type: String, required: true },
  info: {
    identifier: { type: String, required: true },
    isSeekable: { type: Boolean, required: true },
    author: { type: String, required: true },
    length: { type: Number, required: true },
    isStream: { type: Boolean, required: true },
    position: { type: Number, required: true },
    title: { type: String, required: true },
    uri: { type: String, required: true },
    artworkUrl: { type: String },
    isrc: { type: String },
    sourceName: { type: String, required: true }
  },
  requester: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now }
}, { _id: false });

// Audio Filters Schema
const AudioFiltersSchema = new Schema<AudioFilters>({
  bassboost: { type: Number },
  nightcore: { type: Boolean },
  vaporwave: { type: Boolean },
  '8d': { type: Boolean },
  karaoke: { type: Boolean },
  tremolo: { type: Boolean },
  vibrato: { type: Boolean },
  rotation: { type: Boolean },
  distortion: { type: Boolean },
  lowpass: { type: Boolean },
  channelmix: { type: Boolean },
  timescale: { type: Boolean }
}, { _id: false });

// Queue Schema
export const QueueSchema = new Schema<Queue & Document>({
  guildId: { type: String, required: true, unique: true, index: true },
  tracks: [TrackSchema],
  currentIndex: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
  isLooping: { type: String, enum: ['off', 'track', 'queue'], default: 'off' },
  volume: { type: Number, default: 100, min: 0, max: 1000 },
  filters: { type: AudioFiltersSchema, default: {} },
  autoplay: { type: Boolean, default: true },
  voiceChannelId: { type: String },
  textChannelId: { type: String },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Guild Settings Schema
export const GuildSettingsSchema = new Schema<GuildSettings & Document>({
  guildId: { type: String, required: true, unique: true, index: true },
  prefix: { type: String, default: '!' },
  djRoleId: { type: String },
  defaultVolume: { type: Number, default: 100, min: 0, max: 1000 },
  maxQueueLength: { type: Number, default: 1000, min: 1 },
  maxSongDuration: { type: Number, default: 0 }, // 0 = unlimited
  allowDuplicates: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
  announceSongs: { type: Boolean, default: true },
  permissions: {
    play: [{ type: String }],
    skip: [{ type: String }],
    stop: [{ type: String }],
    clear: [{ type: String }],
    shuffle: [{ type: String }],
    volume: [{ type: String }],
    filters: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
export const UserSchema = new Schema<User & Document>({
  discordId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  discriminator: { type: String, required: true },
  avatar: { type: String },
  guilds: [{ type: String }],
  favorites: [{ type: String }], // Track identifiers
  playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
  stats: {
    songsPlayed: { type: Number, default: 0 },
    timeListened: { type: Number, default: 0 }, // milliseconds
    commandsUsed: { type: Number, default: 0 }
  },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Playlist Schema
export const PlaylistSchema = new Schema<Playlist & Document>({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: String, required: true, index: true },
  tracks: [TrackSchema],
  isPublic: { type: Boolean, default: false },
  playCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Favorite Schema
export const FavoriteSchema = new Schema<Favorite & Document>({
  userId: { type: String, required: true, index: true },
  track: { type: TrackSchema, required: true },
  addedAt: { type: Date, default: Date.now }
});

// Stats Schema
const MostPlayedTrackSchema = new Schema({
  track: { type: TrackSchema, required: true },
  playCount: { type: Number, required: true }
}, { _id: false });

const ActiveUserSchema = new Schema({
  userId: { type: String, required: true },
  tracksPlayed: { type: Number, required: true },
  timeListened: { type: Number, required: true }
}, { _id: false });

export const StatsSchema = new Schema<Stats & Document>({
  guildId: { type: String, required: true, unique: true, index: true },
  totalTracksPlayed: { type: Number, default: 0 },
  totalListeningTime: { type: Number, default: 0 }, // milliseconds
  mostPlayedTracks: [MostPlayedTrackSchema],
  activeUsers: [ActiveUserSchema],
  peakConcurrentUsers: { type: Number, default: 0 },
  averageSessionLength: { type: Number, default: 0 }, // milliseconds
  commandsUsed: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
QueueSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 }); // 24 hours
QueueSchema.index({ updatedAt: 1 });
GuildSettingsSchema.index({ updatedAt: 1 });
UserSchema.index({ lastActive: 1 });
UserSchema.index({ 'stats.songsPlayed': -1 });
PlaylistSchema.index({ userId: 1, createdAt: -1 });
FavoriteSchema.index({ userId: 1, addedAt: -1 });
StatsSchema.index({ updatedAt: 1 });

// Pre-save middleware
QueueSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

GuildSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

PlaylistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

StatsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Models
export const QueueModel = mongoose.model<Queue & Document>('Queue', QueueSchema);
export const GuildSettingsModel = mongoose.model<GuildSettings & Document>('GuildSettings', GuildSettingsSchema);
export const UserModel = mongoose.model<User & Document>('User', UserSchema);
export const PlaylistModel = mongoose.model<Playlist & Document>('Playlist', PlaylistSchema);
export const FavoriteModel = mongoose.model<Favorite & Document>('Favorite', FavoriteSchema);
export const StatsModel = mongoose.model<Stats & Document>('Stats', StatsSchema);

// Database connection
export const connectDatabase = async (uri: string): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
};
