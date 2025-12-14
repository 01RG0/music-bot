import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { GuildSettingsModel } from '@utils/schemas';
export const settingsCommand = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Manage guild settings (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
        .setName('view')
        .setDescription('View current guild settings'))
        .addSubcommand(subcommand => subcommand
        .setName('volume')
        .setDescription('Set default volume (0-1000)')
        .addIntegerOption(option => option
        .setName('level')
        .setDescription('Default volume level')
        .setMinValue(0)
        .setMaxValue(1000)
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand
        .setName('djrole')
        .setDescription('Set DJ role for music controls')
        .addRoleOption(option => option
        .setName('role')
        .setDescription('DJ role (leave empty to remove)')))
        .addSubcommand(subcommand => subcommand
        .setName('maxqueue')
        .setDescription('Set maximum queue length')
        .addIntegerOption(option => option
        .setName('length')
        .setDescription('Maximum number of tracks in queue')
        .setMinValue(1)
        .setMaxValue(10000)
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand
        .setName('maxduration')
        .setDescription('Set maximum song duration (0 = unlimited)')
        .addIntegerOption(option => option
        .setName('minutes')
        .setDescription('Maximum duration in minutes (0 = unlimited)')
        .setMinValue(0)
        .setMaxValue(1440) // 24 hours
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand
        .setName('duplicates')
        .setDescription('Allow or disallow duplicate tracks')
        .addBooleanOption(option => option
        .setName('allow')
        .setDescription('Allow duplicate tracks in queue')
        .setRequired(true)))
        .addSubcommand(subcommand => subcommand
        .setName('announce')
        .setDescription('Toggle song announcements')
        .addBooleanOption(option => option
        .setName('enabled')
        .setDescription('Announce when songs start playing')
        .setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const guildId = interaction.guildId;
            const subcommand = interaction.options.getSubcommand();
            switch (subcommand) {
                case 'view':
                    await handleViewSettings(interaction, guildId);
                    break;
                case 'volume':
                    await handleSetVolume(interaction, guildId);
                    break;
                case 'djrole':
                    await handleSetDJRole(interaction, guildId);
                    break;
                case 'maxqueue':
                    await handleSetMaxQueue(interaction, guildId);
                    break;
                case 'maxduration':
                    await handleSetMaxDuration(interaction, guildId);
                    break;
                case 'duplicates':
                    await handleSetDuplicates(interaction, guildId);
                    break;
                case 'announce':
                    await handleSetAnnounce(interaction, guildId);
                    break;
            }
        }
        catch (error) {
            console.error('Settings command error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Failed to manage settings. Please try again.');
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
async function handleViewSettings(interaction, guildId) {
    const settings = await GuildSettingsModel.findOne({ guildId });
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('⚙️ Guild Settings')
        .addFields({
        name: '🎵 Music Settings',
        value: [
            `**Default Volume:** ${settings?.defaultVolume || 100}%`,
            `**Max Queue Length:** ${settings?.maxQueueLength || 1000}`,
            `**Max Song Duration:** ${settings?.maxSongDuration ? `${settings.maxSongDuration} minutes` : 'Unlimited'}`,
            `**Allow Duplicates:** ${settings?.allowDuplicates ? 'Yes' : 'No'}`,
            `**Announce Songs:** ${settings?.announceSongs ? 'Yes' : 'No'}`,
            `**Autoplay:** ${settings?.autoplay ? 'Yes' : 'No'}`
        ].join('\n'),
        inline: true
    }, {
        name: '👤 Permissions',
        value: [
            `**DJ Role:** ${settings?.djRoleId ? `<@&${settings.djRoleId}>` : 'None'}`,
            `**Prefix:** ${settings?.prefix || '!'}`
        ].join('\n'),
        inline: true
    });
    await interaction.editReply({ embeds: [embed] });
}
async function handleSetVolume(interaction, guildId) {
    const volume = interaction.options.getInteger('level', true);
    await GuildSettingsModel.updateOne({ guildId }, {
        defaultVolume: volume,
        updatedAt: new Date()
    }, { upsert: true });
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Settings Updated')
        .setDescription(`Default volume set to **${volume}%**`);
    await interaction.editReply({ embeds: [embed] });
}
async function handleSetDJRole(interaction, guildId) {
    const role = interaction.options.getRole('role');
    await GuildSettingsModel.updateOne({ guildId }, {
        djRoleId: role?.id || null,
        updatedAt: new Date()
    }, { upsert: true });
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Settings Updated')
        .setDescription(role
        ? `DJ role set to **${role.name}**`
        : 'DJ role removed');
    await interaction.editReply({ embeds: [embed] });
}
async function handleSetMaxQueue(interaction, guildId) {
    const length = interaction.options.getInteger('length', true);
    await GuildSettingsModel.updateOne({ guildId }, {
        maxQueueLength: length,
        updatedAt: new Date()
    }, { upsert: true });
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Settings Updated')
        .setDescription(`Maximum queue length set to **${length}** tracks`);
    await interaction.editReply({ embeds: [embed] });
}
async function handleSetMaxDuration(interaction, guildId) {
    const minutes = interaction.options.getInteger('minutes', true);
    await GuildSettingsModel.updateOne({ guildId }, {
        maxSongDuration: minutes,
        updatedAt: new Date()
    }, { upsert: true });
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Settings Updated')
        .setDescription(minutes === 0
        ? 'Maximum song duration set to **unlimited**'
        : `Maximum song duration set to **${minutes} minutes**`);
    await interaction.editReply({ embeds: [embed] });
}
async function handleSetDuplicates(interaction, guildId) {
    const allow = interaction.options.getBoolean('allow', true);
    await GuildSettingsModel.updateOne({ guildId }, {
        allowDuplicates: allow,
        updatedAt: new Date()
    }, { upsert: true });
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Settings Updated')
        .setDescription(`Duplicate tracks are now **${allow ? 'allowed' : 'not allowed'}**`);
    await interaction.editReply({ embeds: [embed] });
}
async function handleSetAnnounce(interaction, guildId) {
    const enabled = interaction.options.getBoolean('enabled', true);
    await GuildSettingsModel.updateOne({ guildId }, {
        announceSongs: enabled,
        updatedAt: new Date()
    }, { upsert: true });
    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Settings Updated')
        .setDescription(`Song announcements are now **${enabled ? 'enabled' : 'disabled'}**`);
    await interaction.editReply({ embeds: [embed] });
}
//# sourceMappingURL=settings.js.map