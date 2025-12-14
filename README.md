# Discord Music Bot with Real-Time Web Dashboard

A full production-ready Discord music bot with a real-time web dashboard that allows you to control everything live through a beautiful web interface.

## Features

### 🎵 Music Playback
- YouTube, SoundCloud, Spotify support
- Auto-search functionality
- Playlist support
- Autoplay related tracks

### 📜 Queue Management
- Persistent per guild queues
- Live queue updates
- Drag & drop reordering
- Remove, move, clear, shuffle operations

### ⏯️ Player Controls
- Play, pause, resume, skip, stop
- Seek functionality
- Volume control
- Loop modes (off, track, queue)

### 🔊 Audio Filters
- Bassboost, Nightcore, Vaporwave, 8D
- Live filter application
- Reset filters

### 🌐 Web Dashboard
- Real-time synchronization with Discord
- Guild-based access control
- Live music controls
- Queue management
- Statistics and analytics
- Favorites and playlists

## Architecture

```
Discord Bot <───┐
                │
Web Dashboard ──┼──> API + WebSocket Server
                │
MongoDB <───────┘
```

## Tech Stack

- **Backend**: Node.js, TypeScript, discord.js v14
- **Music**: Lavalink, Moonlink.js
- **Database**: MongoDB with Mongoose
- **API**: Express.js, Socket.IO
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **State Management**: Zustand

## Project Structure

```
/apps
 ├── bot/          # Discord bot application
 ├── api/          # REST API and WebSocket server
 └── web/          # React web dashboard

/shared
 ├── music/        # Shared music logic and managers
 ├── types/        # TypeScript type definitions
 └── utils/        # Utility functions
```

## Getting Started

1. Clone the repository
2. Copy `env.example` to `.env` and fill in your configuration
3. Install dependencies: `npm run install:all`
4. Set up Lavalink server
5. Start development servers: `npm run dev`

## Deployment

See the deployment guide for production deployment instructions.

## License

MIT
