import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const queueCommand = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue')
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number to display')
        .setMinValue(1)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const guildId = interaction.guildId!;
      const page = interaction.options.getInteger('page') || 1;
      const tracksPerPage = 10;

      const queueInfo = await global.queueManager.getQueueInfo(guildId);

      if (!queueInfo || queueInfo.tracks.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('📜 Queue')
              .setDescription('The queue is empty. Use `/play` to add some music!')
          ]
        });
      }

      const totalPages = Math.ceil(queueInfo.tracks.length / tracksPerPage);
      const startIndex = (page - 1) * tracksPerPage;
      const endIndex = Math.min(startIndex + tracksPerPage, queueInfo.tracks.length);
      const tracks = queueInfo.tracks.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📜 Music Queue')
        .setFooter({ text: `Page ${page}/${totalPages} • Total: ${queueInfo.tracks.length} tracks` });

      let description = '';

      // Current track
      if (queueInfo.currentIndex < queueInfo.tracks.length) {
        const currentTrack = queueInfo.tracks[queueInfo.currentIndex];
        const status = queueInfo.isPlaying ? (queueInfo.isPaused ? '⏸️' : '▶️') : '⏹️';

        description += `${status} **Now Playing:** [${currentTrack.info.title}](${currentTrack.info.uri})\n`;
        description += `👤 ${currentTrack.info.author} • ⏱️ ${formatDuration(currentTrack.info.length)}\n\n`;
      }

      // Queue tracks
      if (tracks.length > 0) {
        description += '**Up Next:**\n';
        tracks.forEach((track, index) => {
          const globalIndex = startIndex + index;
          const isCurrent = globalIndex === queueInfo.currentIndex;

          if (!isCurrent) {
            const position = globalIndex + 1;
            description += `${position}. [${track.info.title}](${track.info.uri}) - ${track.info.author} (${formatDuration(track.info.length)})\n`;
          }
        });
      }

      embed.setDescription(description);

      // Add queue info
      const totalDuration = queueInfo.tracks.reduce((total, track) => total + track.info.length, 0);
      embed.addFields({
        name: '📊 Queue Info',
        value: `**Tracks:** ${queueInfo.tracks.length}\n**Total Duration:** ${formatDuration(totalDuration)}\n**Loop:** ${queueInfo.isLooping}\n**Volume:** ${queueInfo.volume}%`,
        inline: true
      });

      // Create navigation buttons
      const components = [];
      if (totalPages > 1) {
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`queue_prev_${page}`)
              .setLabel('Previous')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId(`queue_next_${page}`)
              .setLabel('Next')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === totalPages)
          );

        components.push(row);
      }

      await interaction.editReply({
        embeds: [embed],
        components
      });

    } catch (error) {
      console.error('Queue command error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Error')
        .setDescription('Failed to display queue. Please try again.');

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};

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
