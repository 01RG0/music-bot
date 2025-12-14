import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const controlCommands = [
  // Pause command
  {
    data: new SlashCommandBuilder()
      .setName('pause')
      .setDescription('Pause the current track'),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;

        const queueInfo = await global.queueManager.getQueueInfo(guildId);
        if (!queueInfo?.isPlaying) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⚠️ Not Playing')
                .setDescription('There is no music currently playing.')
            ]
          });
        }

        await global.playerManager.pause(guildId);

        const embed = new EmbedBuilder()
          .setColor('#FFFF00')
          .setTitle('⏸️ Paused')
          .setDescription('Music playback has been paused.');

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Pause command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to pause music.')
          ]
        });
      }
    }
  },

  // Resume command
  {
    data: new SlashCommandBuilder()
      .setName('resume')
      .setDescription('Resume playback'),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;

        const queueInfo = await global.queueManager.getQueueInfo(guildId);
        if (!queueInfo?.isPaused) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⚠️ Not Paused')
                .setDescription('Music is not currently paused.')
            ]
          });
        }

        await global.playerManager.resume(guildId);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('▶️ Resumed')
          .setDescription('Music playback has been resumed.');

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Resume command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to resume music.')
          ]
        });
      }
    }
  },

  // Skip command
  {
    data: new SlashCommandBuilder()
      .setName('skip')
      .setDescription('Skip the current track'),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;

        const queueInfo = await global.queueManager.getQueueInfo(guildId);
        if (!queueInfo?.isPlaying) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⚠️ Not Playing')
                .setDescription('There is no music currently playing.')
            ]
          });
        }

        const currentTrack = await global.queueManager.getCurrentTrack(guildId);
        await global.playerManager.skip(guildId);

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('⏭️ Skipped')
          .setDescription(`Skipped: **${currentTrack?.info.title || 'Unknown Track'}**`);

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Skip command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to skip track.')
          ]
        });
      }
    }
  },

  // Stop command
  {
    data: new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Stop playback and clear the queue'),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;

        await global.playerManager.stop(guildId);
        await global.queueManager.clearQueue(guildId);

        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('⏹️ Stopped')
          .setDescription('Music playback stopped and queue cleared.');

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Stop command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to stop music.')
          ]
        });
      }
    }
  },

  // Volume command
  {
    data: new SlashCommandBuilder()
      .setName('volume')
      .setDescription('Set the playback volume')
      .addIntegerOption(option =>
        option
          .setName('level')
          .setDescription('Volume level (0-1000)')
          .setMinValue(0)
          .setMaxValue(1000)
          .setRequired(true)
      ),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;
        const volume = interaction.options.getInteger('level', true);

        await global.playerManager.setVolume(guildId, volume);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🔊 Volume Changed')
          .setDescription(`Volume set to **${volume}%**`);

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Volume command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to change volume.')
          ]
        });
      }
    }
  },

  // Seek command
  {
    data: new SlashCommandBuilder()
      .setName('seek')
      .setDescription('Seek to a position in the current track')
      .addStringOption(option =>
        option
          .setName('time')
          .setDescription('Time to seek to (e.g., 1:30, 90)')
          .setRequired(true)
      ),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;
        const timeString = interaction.options.getString('time', true);

        // Parse time string
        const position = parseTimeString(timeString);
        if (position === null) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Invalid Time')
                .setDescription('Please provide time in format like "1:30" or "90" (seconds).')
            ]
          });
        }

        await global.playerManager.seek(guildId, position * 1000); // Convert to milliseconds

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('⏩ Seeked')
          .setDescription(`Seeked to **${formatDuration(position * 1000)}**`);

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Seek command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to seek. The track might not be seekable.')
          ]
        });
      }
    }
  },

  // Now Playing command
  {
    data: new SlashCommandBuilder()
      .setName('nowplaying')
      .setDescription('Show the currently playing track'),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;

        const currentTrack = await global.queueManager.getCurrentTrack(guildId);
        const queueInfo = await global.queueManager.getQueueInfo(guildId);

        if (!currentTrack || !queueInfo?.isPlaying) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⚠️ Not Playing')
                .setDescription('There is no music currently playing.')
            ]
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('🎵 Now Playing')
          .setDescription(`[${currentTrack.info.title}](${currentTrack.info.uri})`)
          .addFields(
            { name: '👤 Author', value: currentTrack.info.author, inline: true },
            { name: '⏱️ Duration', value: formatDuration(currentTrack.info.length), inline: true },
            { name: '🎵 Source', value: currentTrack.info.sourceName, inline: true },
            { name: '🔊 Volume', value: `${queueInfo.volume}%`, inline: true },
            { name: '🔁 Loop', value: queueInfo.isLooping, inline: true },
            { name: '⏯️ Status', value: queueInfo.isPaused ? 'Paused' : 'Playing', inline: true }
          )
          .setThumbnail(currentTrack.info.artworkUrl || null);

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Now playing command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to get current track info.')
          ]
        });
      }
    }
  }
];

function parseTimeString(timeString: string): number | null {
  // Handle MM:SS format
  const timeMatch = timeString.match(/^(\d+):(\d+)$/);
  if (timeMatch) {
    const minutes = parseInt(timeMatch[1]);
    const seconds = parseInt(timeMatch[2]);
    return minutes * 60 + seconds;
  }

  // Handle seconds format
  const seconds = parseInt(timeString);
  if (!isNaN(seconds) && seconds >= 0) {
    return seconds;
  }

  return null;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
