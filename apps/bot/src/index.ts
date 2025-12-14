import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { PlayerManager } from '@music/PlayerManager';
import { QueueManager } from '@music/QueueManager';
import { connectDatabase } from '@utils/schemas';
import { lavalinkConfig, mongoConfig, wsConfig, botConfig } from '@music/config';
import { registerCommands } from './commands';
import { setupEventHandlers } from './events';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize managers
const playerManager = new PlayerManager(lavalinkConfig, wsConfig.url);
const queueManager = new QueueManager(wsConfig.url);

// Store managers globally
declare global {
  var playerManager: PlayerManager;
  var queueManager: QueueManager;
}

global.playerManager = playerManager;
global.queueManager = queueManager;

async function main() {
  try {
    // Connect to database
    await connectDatabase(mongoConfig.uri);
    console.log('✅ Database connected');

    // Register slash commands
    await registerCommands();
    console.log('✅ Commands registered');

    // Setup event handlers
    setupEventHandlers(client);

    // Login bot
    await client.login(botConfig.token);
    console.log(`✅ Bot logged in as ${client.user?.tag}`);

    // Handle Moonlink voice updates
    playerManager.on('sendPacket', (guildId: string, packet: any) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        guild.shard.send(packet);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down bot...');

  // Destroy all players
  for (const [guildId] of playerManager['players']) {
    await playerManager.destroyPlayer(guildId);
  }

  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

main();
