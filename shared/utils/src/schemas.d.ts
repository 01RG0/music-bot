import mongoose from 'mongoose';
import { Queue, GuildSettings, User, Playlist, Favorite, Stats } from '@types/index';
export declare const QueueSchema: mongoose.Schema<Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Model<Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, any, any, mongoose.Document<unknown, any, Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, {}> & Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Document<unknown, {}, mongoose.FlatRecord<Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const GuildSettingsSchema: mongoose.Schema<GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Model<GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, any, any, mongoose.Document<unknown, any, GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, {}> & GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Document<unknown, {}, mongoose.FlatRecord<GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const UserSchema: mongoose.Schema<User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Model<User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, any, any, mongoose.Document<unknown, any, User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, {}> & User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Document<unknown, {}, mongoose.FlatRecord<User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const PlaylistSchema: mongoose.Schema<Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Model<Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, any, any, mongoose.Document<unknown, any, Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, {}> & Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: string & mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Document<unknown, {}, mongoose.FlatRecord<Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>> & Required<{
    _id: string & mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const FavoriteSchema: mongoose.Schema<Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Model<Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, any, any, mongoose.Document<unknown, any, Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, {}> & Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Document<unknown, {}, mongoose.FlatRecord<Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const StatsSchema: mongoose.Schema<Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Model<Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, any, any, mongoose.Document<unknown, any, Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, any, {}> & Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, mongoose.Document<unknown, {}, mongoose.FlatRecord<Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const QueueModel: mongoose.Model<Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}, {}, mongoose.Document<unknown, {}, Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}> & Queue & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const GuildSettingsModel: mongoose.Model<GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}, {}, mongoose.Document<unknown, {}, GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}> & GuildSettings & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const UserModel: mongoose.Model<User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}, {}, mongoose.Document<unknown, {}, User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}> & User & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const PlaylistModel: mongoose.Model<Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}, {}, mongoose.Document<unknown, {}, Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}> & Playlist & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: string & mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const FavoriteModel: mongoose.Model<Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}, {}, mongoose.Document<unknown, {}, Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}> & Favorite & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const StatsModel: mongoose.Model<Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}, {}, mongoose.Document<unknown, {}, Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}>, {}, {}> & Stats & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const connectDatabase: (uri: string) => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
//# sourceMappingURL=schemas.d.ts.map