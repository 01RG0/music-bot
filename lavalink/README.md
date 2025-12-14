# Lavalink Setup

Lavalink is the audio server that handles music streaming for the Discord bot.

## Quick Start with Docker (Recommended)

1. **Install Docker and Docker Compose**

2. **Start Lavalink:**
   ```bash
   cd lavalink
   docker-compose up -d
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f lavalink
   ```

4. **Stop Lavalink:**
   ```bash
   docker-compose down
   ```

## Manual Installation

1. **Download Lavalink JAR:**
   ```bash
   wget https://github.com/lavalink-devs/Lavalink/releases/download/4.0.1/Lavalink.jar
   ```

2. **Run Lavalink:**
   ```bash
   java -jar Lavalink.jar
   ```

## Configuration

The `application.yml` file contains all Lavalink configuration:

- **Server Settings:**
  - Port: 2333
  - Password: "youshallnotpass"

- **Audio Sources:**
  - YouTube ✅
  - SoundCloud ✅
  - Bandcamp ✅
  - Twitch ✅
  - Vimeo ✅
  - HTTP streams ✅

- **Audio Filters:**
  - Volume control ✅
  - Equalizer ✅
  - Karaoke ✅
  - Tremolo ✅
  - Vibrato ✅
  - Distortion ✅
  - Rotation (8D) ✅
  - Channel mix ✅
  - Low pass ✅

## Environment Variables

Set these in your `.env` file:

```env
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

## Troubleshooting

### Connection Issues
- Ensure Lavalink is running on the correct port
- Check firewall settings
- Verify the password matches

### Audio Quality Issues
- Increase `bufferDurationMs` in config
- Check network connectivity
- Ensure sufficient CPU/RAM resources

### High CPU Usage
- Reduce `opusEncodingQuality` (try 8 or 9)
- Lower `resamplingQuality` to LOW
- Increase `playerUpdateInterval`

## Production Deployment

For production, consider:

1. **Use a VPS with good network connectivity**
2. **Allocate sufficient resources:**
   - 2GB RAM minimum
   - 1-2 CPU cores
   - Fast SSD storage

3. **Use a reverse proxy (nginx) for SSL termination**

4. **Monitor with Prometheus metrics** (enable in config)

5. **Set up automatic restarts** with process managers

## Security

- Change the default password
- Use HTTPS in production
- Restrict access with firewall rules
- Consider IP whitelisting for rate limiting
