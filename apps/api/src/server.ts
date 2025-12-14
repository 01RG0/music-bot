import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from '@utils/schemas';
import { apiConfig, mongoConfig, wsConfig } from '@music/config';
import { authRouter } from './routes/auth';
import { guildsRouter } from './routes/guilds';
import { musicRouter } from './routes/music';
import { statsRouter } from './routes/stats';
import { playlistsRouter } from './routes/playlists';
import { settingsRouter } from './routes/settings';
import { setupWebSocketServer } from './websocket';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/guilds', guildsRouter);
app.use('/api/music', musicRouter);
app.use('/api/stats', statsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/settings', settingsRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Setup WebSocket server
setupWebSocketServer(io);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase(mongoConfig.uri);

    // Start HTTP server
    server.listen(apiConfig.port, apiConfig.host, () => {
      console.log(`🚀 API server running on http://${apiConfig.host}:${apiConfig.port}`);
      console.log(`🌐 WebSocket server ready`);
    });

  } catch (error) {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down API server...');
  server.close(() => {
    console.log('✅ API server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down API server...');
  server.close(() => {
    console.log('✅ API server closed');
    process.exit(0);
  });
});

startServer();
