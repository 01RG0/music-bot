import jwt from 'jsonwebtoken';
import { apiConfig } from '@music/config';
import { UserModel } from '@utils/schemas';
import { SecurityManager } from './utils/security';
export function setupWebSocketServer(io) {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication token required'));
            }
            // Verify JWT token
            const decoded = jwt.verify(token, apiConfig.jwtSecret);
            // Verify user exists
            const user = await UserModel.findOne({ discordId: decoded.discordId });
            if (!user) {
                return next(new Error('User not found'));
            }
            // Check if token is expired
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                return next(new Error('Token expired'));
            }
            // Attach user info to socket
            socket.userId = user._id.toString();
            socket.discordId = decoded.discordId;
            socket.guilds = user.guilds;
            // Log connection for monitoring
            console.log(`🔐 WebSocket authenticated: ${socket.id} (${decoded.discordId})`);
            next();
        }
        catch (error) {
            console.error('WebSocket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔗 WebSocket connected: ${socket.id} (User: ${socket.discordId})`);
        // Join user's guilds
        if (socket.guilds) {
            socket.guilds.forEach(guildId => {
                socket.join(`guild:${guildId}`);
            });
        }
        // Join user-specific room
        socket.join(`user:${socket.userId}`);
        // Handle guild-specific subscriptions
        socket.on('subscribe:guild', (guildId) => {
            if (socket.guilds?.includes(guildId)) {
                socket.join(`guild:${guildId}`);
                console.log(`📡 ${socket.id} subscribed to guild ${guildId}`);
            }
            else {
                socket.emit('error', { message: 'Access denied to this guild' });
            }
        });
        socket.on('unsubscribe:guild', (guildId) => {
            socket.leave(`guild:${guildId}`);
            console.log(`📡 ${socket.id} unsubscribed from guild ${guildId}`);
        });
        // Handle music control events from web dashboard
        socket.on('web:play', async (data) => {
            if (!socket.guilds?.includes(data.guildId)) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }
            // Validate query
            if (!data.query || data.query.trim().length === 0) {
                socket.emit('web:play:response', {
                    success: false,
                    error: 'Query cannot be empty'
                });
                return;
            }
            try {
                // Check permissions and cooldowns
                const permission = await SecurityManager.checkCommandPermission(socket.discordId, data.guildId, 'play');
                if (!permission.allowed) {
                    socket.emit('web:play:response', {
                        success: false,
                        error: 'Permission denied'
                    });
                    return;
                }
                const cooldown = SecurityManager.checkCooldown(socket.discordId, data.guildId, 'play', 3000);
                if (!cooldown.allowed) {
                    socket.emit('web:play:response', {
                        success: false,
                        error: `Command on cooldown. Try again in ${Math.ceil((cooldown.remainingTime || 0) / 1000)} seconds.`
                    });
                    return;
                }
                const spamCheck = SecurityManager.checkSpam(socket.discordId);
                if (spamCheck.isSpam) {
                    socket.emit('web:play:response', {
                        success: false,
                        error: 'Too many requests. Please slow down.'
                    });
                    return;
                }
                const tracks = await global.queueManager.searchAndAdd(data.guildId, data.query, socket.discordId, (q) => global.playerManager.search(q));
                if (tracks.length > 0) {
                    const queueInfo = await global.queueManager.getQueueInfo(data.guildId);
                    if (!queueInfo?.isPlaying) {
                        await global.playerManager.playTrack(data.guildId, tracks[0]);
                        await global.queueManager.saveQueue(data.guildId, { isPlaying: true });
                    }
                }
                socket.emit('web:play:response', {
                    success: true,
                    tracks
                });
            }
            catch (error) {
                console.error('Web play error:', error);
                socket.emit('web:play:response', {
                    success: false,
                    error: 'Failed to play track'
                });
            }
        });
        socket.on('web:control', async (data) => {
            if (!socket.guilds?.includes(data.guildId)) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }
            try {
                switch (data.action) {
                    case 'pause':
                        await global.playerManager.pause(data.guildId);
                        break;
                    case 'resume':
                        await global.playerManager.resume(data.guildId);
                        break;
                    case 'skip':
                        await global.playerManager.skip(data.guildId);
                        break;
                    case 'stop':
                        await global.playerManager.stop(data.guildId);
                        await global.queueManager.clearQueue(data.guildId);
                        break;
                    case 'volume':
                        if (typeof data.params?.volume === 'number') {
                            await global.playerManager.setVolume(data.guildId, data.params.volume);
                        }
                        break;
                    case 'seek':
                        if (typeof data.params?.position === 'number') {
                            await global.playerManager.seek(data.guildId, data.params.position * 1000);
                        }
                        break;
                    case 'filters':
                        if (data.params?.filters) {
                            await global.playerManager.setFilters(data.guildId, data.params.filters);
                        }
                        break;
                    case 'filterPreset':
                        if (data.params?.preset) {
                            await global.playerManager.applyFilterPreset(data.guildId, data.params.preset);
                        }
                        break;
                    default:
                        socket.emit('error', { message: 'Unknown action' });
                        return;
                }
                socket.emit('web:control:response', {
                    success: true,
                    action: data.action
                });
            }
            catch (error) {
                console.error(`Web control ${data.action} error:`, error);
                socket.emit('web:control:response', {
                    success: false,
                    action: data.action,
                    error: 'Failed to execute action'
                });
            }
        });
        socket.on('web:queue', async (data) => {
            if (!socket.guilds?.includes(data.guildId)) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }
            try {
                switch (data.action) {
                    case 'add':
                        if (data.params?.query) {
                            const tracks = await global.queueManager.searchAndAdd(data.guildId, data.params.query, socket.discordId, (q) => global.playerManager.search(q));
                            socket.emit('web:queue:response', { success: true, action: 'add', tracks });
                        }
                        break;
                    case 'remove':
                        if (typeof data.params?.index === 'number') {
                            const removedTrack = await global.queueManager.removeTrack(data.guildId, data.params.index);
                            socket.emit('web:queue:response', { success: true, action: 'remove', removedTrack });
                        }
                        break;
                    case 'move':
                        if (typeof data.params?.from === 'number' && typeof data.params?.to === 'number') {
                            await global.queueManager.moveTrack(data.guildId, data.params.from, data.params.to);
                            socket.emit('web:queue:response', { success: true, action: 'move' });
                        }
                        break;
                    case 'clear':
                        await global.queueManager.clearQueue(data.guildId);
                        socket.emit('web:queue:response', { success: true, action: 'clear' });
                        break;
                    case 'shuffle':
                        await global.queueManager.shuffleQueue(data.guildId);
                        socket.emit('web:queue:response', { success: true, action: 'shuffle' });
                        break;
                    default:
                        socket.emit('error', { message: 'Unknown queue action' });
                        return;
                }
            }
            catch (error) {
                console.error(`Web queue ${data.action} error:`, error);
                socket.emit('web:queue:response', {
                    success: false,
                    action: data.action,
                    error: 'Failed to execute queue action'
                });
            }
        });
        socket.on('web:loop', async (data) => {
            if (!socket.guilds?.includes(data.guildId)) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }
            try {
                await global.queueManager.setLoopMode(data.guildId, data.mode);
                socket.emit('web:loop:response', { success: true, mode: data.mode });
            }
            catch (error) {
                console.error('Web loop error:', error);
                socket.emit('web:loop:response', { success: false, error: 'Failed to set loop mode' });
            }
        });
        socket.on('web:autoplay', async (data) => {
            if (!socket.guilds?.includes(data.guildId)) {
                socket.emit('error', { message: 'Access denied' });
                return;
            }
            try {
                await global.queueManager.setAutoplay(data.guildId, data.enabled);
                socket.emit('web:autoplay:response', { success: true, enabled: data.enabled });
            }
            catch (error) {
                console.error('Web autoplay error:', error);
                socket.emit('web:autoplay:response', { success: false, error: 'Failed to set autoplay' });
            }
        });
        // Handle disconnections
        socket.on('disconnect', () => {
            console.log(`🔌 WebSocket disconnected: ${socket.id}`);
        });
        // Send initial state
        socket.emit('connected', {
            userId: socket.userId,
            guilds: socket.guilds
        });
    });
    // Forward events from PlayerManager and QueueManager to WebSocket clients
    setupEventForwarding(io);
}
function setupEventForwarding(io) {
    // Player events
    global.playerManager.on('player:play', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:play', data);
    });
    global.playerManager.on('player:pause', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:pause', data);
    });
    global.playerManager.on('player:resume', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:resume', data);
    });
    global.playerManager.on('player:skip', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:skip', data);
    });
    global.playerManager.on('player:stop', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:stop', data);
    });
    global.playerManager.on('player:volume', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:volume', data);
    });
    global.playerManager.on('player:seek', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:seek', data);
    });
    global.playerManager.on('player:filters', (data) => {
        io.to(`guild:${data.guildId}`).emit('player:filters', data);
    });
    // Queue events
    global.queueManager.on('queue:update', (data) => {
        io.to(`guild:${data.guildId}`).emit('queue:update', data);
    });
    global.queueManager.on('queue:add', (data) => {
        io.to(`guild:${data.guildId}`).emit('queue:add', data);
    });
    global.queueManager.on('queue:remove', (data) => {
        io.to(`guild:${data.guildId}`).emit('queue:remove', data);
    });
    global.queueManager.on('queue:clear', (data) => {
        io.to(`guild:${data.guildId}`).emit('queue:clear', data);
    });
    global.queueManager.on('queue:shuffle', (data) => {
        io.to(`guild:${data.guildId}`).emit('queue:shuffle', data);
    });
    global.queueManager.on('queue:move', (data) => {
        io.to(`guild:${data.guildId}`).emit('queue:move', data);
    });
    // Track events
    global.playerManager.on('track:start', (data) => {
        io.to(`guild:${data.guildId}`).emit('track:start', data);
    });
    global.playerManager.on('track:end', (data) => {
        io.to(`guild:${data.guildId}`).emit('track:end', data);
    });
    global.playerManager.on('track:stuck', (data) => {
        io.to(`guild:${data.guildId}`).emit('track:stuck', data);
    });
    global.playerManager.on('track:error', (data) => {
        io.to(`guild:${data.guildId}`).emit('track:error', data);
    });
    // Voice events
    global.playerManager.on('voice:join', (data) => {
        io.to(`guild:${data.guildId}`).emit('voice:join', data);
    });
    global.playerManager.on('voice:leave', (data) => {
        io.to(`guild:${data.guildId}`).emit('voice:leave', data);
    });
    global.playerManager.on('voice:error', (data) => {
        io.to(`guild:${data.guildId}`).emit('voice:error', data);
    });
}
//# sourceMappingURL=websocket.js.map