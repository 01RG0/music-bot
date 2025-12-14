import { VoiceState } from 'discord.js';

export async function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
  const guildId = oldState.guild.id;
  const player = global.playerManager['players'].get(guildId);

  if (!player) return;

  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  // Bot was disconnected
  if (oldChannel && !newChannel && oldState.member?.id === oldState.client.user?.id) {
    console.log(`Bot disconnected from voice channel in guild ${guildId}`);
    await global.playerManager.destroyPlayer(guildId);
    return;
  }

  // Bot was moved to a different channel
  if (oldChannel && newChannel && oldState.member?.id === oldState.client.user?.id && oldChannel.id !== newChannel.id) {
    console.log(`Bot moved to different voice channel in guild ${guildId}: ${newChannel.name}`);

    // Update player with new channel
    player.setVoiceChannel(newChannel.id);
    return;
  }

  // Check if bot is alone in channel
  if (newChannel && oldState.member?.id === oldState.client.user?.id) {
    // Bot joined or moved to a channel
    setTimeout(() => checkAloneAndLeave(guildId, newChannel.id), 30000); // Check after 30 seconds
  } else if (oldChannel && !newChannel && oldState.member?.id !== oldState.client.user?.id) {
    // Someone left the channel (not the bot)
    setTimeout(() => checkAloneAndLeave(guildId, oldChannel.id), 30000);
  }
}

async function checkAloneAndLeave(guildId: string, channelId: string) {
  try {
    const player = global.playerManager['players'].get(guildId);
    if (!player) return;

    const guild = player.guild;
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel?.isVoiceBased()) return;

    // Count human members in channel
    const humanMembers = channel.members.filter(member => !member.user.bot).size;

    if (humanMembers === 0) {
      console.log(`Leaving empty voice channel in guild ${guildId}`);
      await global.playerManager.destroyPlayer(guildId);
    }
  } catch (error) {
    console.error('Error checking alone status:', error);
  }
}
