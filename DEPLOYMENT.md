# Discord Music Bot - Production Deployment Guide

This guide covers deploying the full Discord music bot system with real-time web dashboard.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord Bot   │    │   Lavalink      │    │   MongoDB       │
│   (Node.js)     │◄──►│   (Java)        │    │   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                     │
         └────────────────────────┼─────────────────────┘
                                  ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   API Server    │    │   Web Dashboard │
                    │   (Node.js)     │    │   (React)       │
                    │   WebSocket     │    │                 │
                    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5+
- Java 11+ (for Lavalink)
- Discord Bot Token
- Discord OAuth2 Application
- VPS/Server with 2GB+ RAM

## 🚀 Quick Start Deployment

### 1. Environment Setup

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Required environment variables:
```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/auth/callback

# Lavalink Configuration
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# Database
MONGODB_URI=mongodb://localhost:27017/discord-music-bot

# API Configuration
API_PORT=4000
API_HOST=0.0.0.0
JWT_SECRET=your_super_secure_jwt_secret

# Web Configuration
WEB_PORT=3000
WEB_HOST=0.0.0.0

# WebSocket Auth
WS_AUTH_TOKEN=your_websocket_auth_token
```

### 2. Lavalink Setup

#### Using Docker (Recommended)
```bash
cd lavalink
docker-compose up -d
```

#### Manual Installation
```bash
# Download Lavalink
wget https://github.com/lavalink-devs/Lavalink/releases/download/4.0.1/Lavalink.jar

# Run Lavalink
java -jar Lavalink.jar
```

### 3. Database Setup

#### Using MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and database
3. Get connection string
4. Update `MONGODB_URI` in `.env`

#### Using Local MongoDB
```bash
# Install MongoDB
sudo apt update && sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 4. Application Deployment

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
npm install

# Build all apps
npm run build

# Start all services
pm2 start ecosystem.config.js
```

#### Using Docker Compose (Full Stack)
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:5
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  lavalink:
    image: fredboat/lavalink:4.0.1
    restart: unless-stopped
    ports:
      - "2333:2333"
    volumes:
      - ./lavalink/application.yml:/opt/Lavalink/application.yml
    environment:
      JAVA_OPTS: -Xmx1G

  api:
    build: ./apps/api
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb

  web:
    build: ./apps/web
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  mongodb_data:
```

### 5. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to "Bot" section and create bot
4. Copy token to `.env`
5. Go to "OAuth2" section:
   - Add redirect URI: `https://yourdomain.com/auth/callback`
   - Copy Client ID and Client Secret to `.env`
6. Generate bot invite URL:
   ```
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=414464658496&scope=bot%20applications.commands
   ```

## 🔧 Configuration Files

### PM2 Ecosystem Config
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'discord-bot',
      script: 'apps/bot/dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'api-server',
      script: 'apps/api/dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'web-dashboard',
      script: 'apps/web/dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/discord-music-bot
server {
    listen 80;
    server_name yourdomain.com;

    # API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Web Dashboard
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Scaling

### Health Checks
```bash
# Check all services
curl http://localhost:4000/health
curl http://localhost:3000/health

# Lavalink health
curl http://localhost:2333/version
```

### PM2 Monitoring
```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all

# View status
pm2 status
```

### Scaling Strategy

#### Vertical Scaling
- **Bot**: 1GB RAM, 1 CPU core
- **API**: 512MB RAM per instance, 2+ CPU cores
- **Web**: 256MB RAM, 1 CPU core
- **Lavalink**: 1-2GB RAM, dedicated CPU cores
- **MongoDB**: 2GB+ RAM, SSD storage

#### Horizontal Scaling
```javascript
// PM2 cluster mode for API
{
  name: 'api-server',
  script: 'apps/api/dist/server.js',
  instances: 'max', // CPU core count
  exec_mode: 'cluster',
  load_balancer: true
}
```

#### Database Scaling
```javascript
// MongoDB connection with pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

## 🚨 Common Issues & Fixes

### Lavalink Connection Issues
```bash
# Check if Lavalink is running
curl http://localhost:2333/version

# View Lavalink logs
docker logs lavalink

# Common fixes:
# 1. Check firewall (port 2333)
# 2. Verify password in application.yml
# 3. Check Java version (11+ required)
# 4. Increase RAM allocation
```

### Discord Bot Issues
```javascript
// Check bot permissions
// Ensure bot has these permissions:
// - Send Messages
// - Use Voice Activity
// - Connect
// - Speak
// - Use Slash Commands

// Check bot status
pm2 logs discord-bot
```

### WebSocket Issues
```javascript
// Check WebSocket connection
// Common fixes:
// 1. Verify WS_AUTH_TOKEN
// 2. Check CORS settings
// 3. Verify JWT tokens
// 4. Check firewall (ports 4000, 3000)
```

### Database Issues
```javascript
// Check MongoDB connection
mongosh --eval "db.stats()"

// Common fixes:
// 1. Check connection string
// 2. Verify credentials
// 3. Check network connectivity
// 4. Monitor disk space
```

### Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Increase memory limits
pm2 start app --max-memory-restart 800M

# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Rate Limiting Issues
```javascript
// Adjust rate limits in middleware/rateLimiter.ts
// Common fixes:
// 1. Increase limits for legitimate traffic
// 2. Add whitelisted IPs
// 3. Implement user-based limits
```

## 🔒 Security Best Practices

### Environment Variables
```bash
# Never commit .env files
echo '.env' >> .gitignore

# Use strong secrets
openssl rand -base64 32
```

### Network Security
```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Use SSL certificates
sudo certbot --nginx -d yourdomain.com
```

### API Security
```javascript
// Use HTTPS in production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Database Security
```javascript
// Use authentication
mongodb://username:password@localhost:27017/dbname

// Enable SSL
mongoose.connect(uri, {
  ssl: true,
  sslValidate: true,
  sslCA: '/path/to/ca.pem'
});
```

## 📈 Performance Optimization

### Lavalink Optimization
```yaml
# lavalink/application.yml
lavalink:
  server:
    bufferDurationMs: 400
    frameBufferDurationMs: 5000
    opusEncodingQuality: 10
    resamplingQuality: LOW
    trackStuckThresholdMs: 10000
```

### Database Optimization
```javascript
// Create indexes
db.queues.createIndex({ guildId: 1 }, { unique: true });
db.queues.createIndex({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

// Use aggregation pipelines for stats
db.tracks.aggregate([
  { $group: { _id: '$requester', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);
```

### Caching Strategy
```javascript
// Redis for session storage (optional)
const Redis = require('ioredis');
const redis = new Redis();

// Cache frequently accessed data
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --db discord-music-bot --out /backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db discord-music-bot --out /backup/$DATE
find /backup -type d -mtime +7 -exec rm -rf {} \;
```

### File Backup
```bash
# Backup configuration files
tar -czf config_backup.tar.gz \
  .env \
  lavalink/application.yml \
  ecosystem.config.js
```

### Recovery
```bash
# Restore database
mongorestore --db discord-music-bot /backup/latest

# Restore configurations
tar -xzf config_backup.tar.gz
```

## 📞 Support & Troubleshooting

### Logs Location
```bash
# PM2 logs
pm2 logs

# Lavalink logs
docker logs lavalink
tail -f lavalink/logs/lavalink.log

# Application logs
tail -f logs/app.log
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
export NODE_ENV=development

# Lavalink debug
logging:
  level:
    lavalink: DEBUG
```

### Health Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    lavalink: await checkLavalinkHealth(),
    database: await checkDatabaseHealth()
  };

  res.json(health);
});
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Lavalink running and accessible
- [ ] MongoDB connection established
- [ ] Discord bot token valid
- [ ] OAuth2 redirect URI set
- [ ] PM2 processes running
- [ ] Nginx configured and running
- [ ] Domain DNS pointing to server
- [ ] Backup system in place
- [ ] Monitoring tools configured
- [ ] Log rotation configured

## 🚀 Going Live

1. **Test locally**: `npm run dev`
2. **Deploy to staging**: Test all features
3. **Configure production**: Update environment variables
4. **Deploy to production**: `pm2 start ecosystem.config.js`
5. **Monitor**: Check logs and metrics
6. **Scale**: Adjust resources as needed
7. **Backup**: Set up automated backups

## 📈 Scaling to Multiple Servers

For high-traffic deployments:

1. **Load Balancer**: Use nginx upstream or AWS ALB
2. **Database Cluster**: MongoDB replica set
3. **Redis Cluster**: For session storage and caching
4. **CDN**: For static assets
5. **Monitoring**: Prometheus + Grafana
6. **Container Orchestration**: Docker Swarm or Kubernetes

This deployment guide provides a production-ready setup for your Discord music bot with real-time web dashboard.
