import { Client } from 'discord.js';

export async function handleReady(client: Client) {
  console.log(`🎵 Music bot ready! Logged in as ${client.user?.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guilds`);

  // Set bot status
  client.user?.setPresence({
    activities: [{
      name: '/play to start music!',
      type: 2 // Listening
    }],
    status: 'online'
  });

  // Log guild info
  client.guilds.cache.forEach(guild => {
    console.log(`- ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
  });
}
