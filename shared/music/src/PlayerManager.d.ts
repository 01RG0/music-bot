import { EventEmitter } from 'events';
import { MoonlinkPlayer, MoonlinkTrack } from 'moonlink.js';
import { Track, AudioFilters, PlayerState, FilterPreset } from '@types/index';
export declare class PlayerManager extends EventEmitter {
    private lavalinkConfig;
    private moonlink;
    private socketClient?;
    private players;
    private reconnectAttempts;
    constructor(lavalinkConfig: {
        host: string;
        port: number;
        password: string;
        secure: boolean;
    }, socketUrl?: string);
    private connectSocket;
    private setupMoonlinkEvents;
    private handleTrackEnd;
    private handleAutoplay;
    private handleReconnection;
    private convertTrack;
    private emitToSocket;
    private updateQueueActivity;
    private updateStats;
    createPlayer(guildId: string, voiceChannelId: string, textChannelId: string): Promise<MoonlinkPlayer>;
    destroyPlayer(guildId: string): Promise<void>;
    playTrack(guildId: string, track: Track): Promise<void>;
    pause(guildId: string): Promise<void>;
    resume(guildId: string): Promise<void>;
    stop(guildId: string): Promise<void>;
    skip(guildId: string): Promise<void>;
    seek(guildId: string, position: number): Promise<void>;
    setVolume(guildId: string, volume: number): Promise<void>;
    setFilters(guildId: string, filters: AudioFilters): Promise<void>;
    applyFilterPreset(guildId: string, preset: FilterPreset): Promise<void>;
    getPlayerState(guildId: string): PlayerState | null;
    handleVoiceUpdate(guildId: string, sessionId: string, event: any): void;
    search(query: string): Promise<MoonlinkTrack[]>;
}
//# sourceMappingURL=PlayerManager.d.ts.map