import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { GuildSettingsModel } from '@utils/schemas';
export const playCommand = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube, SoundCloud, or other sources')
        .addStringOption(option => option
        .setName('query')
        .setDescription('Song name, URL, or playlist URL')
        .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const member = interaction.member;
            const guildId = interaction.guildId;
            // Check permissions
            const settings = await GuildSettingsModel.findOne({ guildId });
            if (settings?.permissions?.play && settings.permissions.play.length > 0) {
                const hasPermission = settings.permissions.play.some(roleId => member.roles.cache.has(roleId));
                if (!hasPermission && !member.permissions.has('Administrator')) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#FF0000')
                                .setTitle('❌ Permission Denied')
                                .setDescription('You do not have permission to use the play command.')
                        ]
                    });
                }
            }
            const voiceChannel = member.voice.channel;
            if (!voiceChannel) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('❌ Error')
                            .setDescription('You must be in a voice channel to play music!')
                    ]
                });
            }
            const query = interaction.options.getString('query', true);
            // Check bot permissions
            const botPermissions = voiceChannel.permissionsFor(interaction.guild.members.me);
            if (!botPermissions?.has(['Connect', 'Speak'])) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('❌ Error')
                            .setDescription('I need permission to connect and speak in your voice channel!')
                    ]
                });
            }
            // Get or create player
            let player = global.playerManager['players'].get(guildId);
            if (!player) {
                player = await global.playerManager.createPlayer(guildId, voiceChannel.id, interaction.channelId);
            }
            // Search for tracks
            const tracks = await global.queueManager.searchAndAdd(guildId, query, interaction.user.id, (q) => global.playerManager.search(q));
            if (tracks.length === 0) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('❌ No Results')
                            .setDescription('No tracks found for your search query.')
                    ]
                });
            }
            // Start playing if queue was empty
            const queueInfo = await global.queueManager.getQueueInfo(guildId);
            const shouldStartPlaying = !queueInfo?.isPlaying && queueInfo?.tracks.length === tracks.length;
            if (shouldStartPlaying) {
                await global.playerManager.playTrack(guildId, tracks[0]);
                await global.queueManager.setPlayingStatus(guildId, true);
            }
            // Create response embed
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎵 Added to Queue');
            if (tracks.length === 1) {
                const track = tracks[0];
                embed.setDescription(`**[${track.info.title}](${track.info.uri})**`)
                    .addFields({ name: '👤 Author', value: track.info.author, inline: true }, { name: '⏱️ Duration', value: formatDuration(track.info.length), inline: true }, { name: '🎵 Source', value: track.info.sourceName, inline: true })
                    .setThumbnail(track.info.artworkUrl || null);
            }
            else {
                embed.setDescription(`Added **${tracks.length}** tracks to the queue`)
                    .addFields({ name: '📋 Tracks', value: tracks.slice(0, 5).map((t, i) => `${i + 1}. ${t.info.title}`).join('\n'), inline: false });
            }
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('Play command error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('An error occurred while trying to play music. Please try again.');
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            }
            else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
}
//# sourceMappingURL=play.js.map