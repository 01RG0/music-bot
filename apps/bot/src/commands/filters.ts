import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { AudioFilters, FILTER_PRESETS, FilterPreset } from '@types/index';

export const filterCommands = [
  // Apply filter preset
  {
    data: new SlashCommandBuilder()
      .setName('filter')
      .setDescription('Apply audio filters')
      .addStringOption(option =>
        option
          .setName('preset')
          .setDescription('Filter preset to apply')
          .setRequired(true)
          .addChoices(
            { name: 'Bass Boost', value: 'bassboost' },
            { name: 'Nightcore', value: 'nightcore' },
            { name: 'Vaporwave', value: 'vaporwave' },
            { name: '8D Audio', value: '8d' },
            { name: 'Reset Filters', value: 'reset' }
          )
      ),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;
        const preset = interaction.options.getString('preset', true) as FilterPreset;

        await global.playerManager.applyFilterPreset(guildId, preset);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎛️ Filter Applied')
          .setDescription(`Applied **${preset}** filter preset.`);

        // Add filter details
        const filters = FILTER_PRESETS[preset];
        if (Object.keys(filters).length > 0) {
          const filterList = Object.entries(filters)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          embed.addFields({
            name: 'Applied Filters',
            value: filterList,
            inline: false
          });
        }

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Filter command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to apply filter.')
          ]
        });
      }
    }
  },

  // Custom filter command
  {
    data: new SlashCommandBuilder()
      .setName('customfilter')
      .setDescription('Apply custom audio filters')
      .addNumberOption(option =>
        option
          .setName('bassboost')
          .setDescription('Bass boost level (-0.5 to 0.5)')
          .setMinValue(-0.5)
          .setMaxValue(0.5)
      )
      .addBooleanOption(option =>
        option
          .setName('nightcore')
          .setDescription('Enable nightcore effect')
      )
      .addBooleanOption(option =>
        option
          .setName('vaporwave')
          .setDescription('Enable vaporwave effect')
      )
      .addBooleanOption(option =>
        option
          .setName('8d')
          .setDescription('Enable 8D audio effect')
      ),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;

        const filters: AudioFilters = {};

        // Collect filter options
        const bassboost = interaction.options.getNumber('bassboost');
        const nightcore = interaction.options.getBoolean('nightcore');
        const vaporwave = interaction.options.getBoolean('vaporwave');
        const eightD = interaction.options.getBoolean('8d');

        if (bassboost !== null) filters.bassboost = bassboost;
        if (nightcore !== null) filters.nightcore = nightcore;
        if (vaporwave !== null) filters.vaporwave = vaporwave;
        if (eightD !== null) filters['8d'] = eightD;

        if (Object.keys(filters).length === 0) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⚠️ No Filters')
                .setDescription('Please specify at least one filter option.')
            ]
          });
        }

        await global.playerManager.setFilters(guildId, filters);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎛️ Custom Filters Applied')
          .setDescription('Applied custom audio filters.');

        const filterList = Object.entries(filters)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

        embed.addFields({
          name: 'Applied Filters',
          value: filterList,
          inline: false
        });

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Custom filter command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to apply custom filters.')
          ]
        });
      }
    }
  },

  // Loop command
  {
    data: new SlashCommandBuilder()
      .setName('loop')
      .setDescription('Set loop mode for playback')
      .addStringOption(option =>
        option
          .setName('mode')
          .setDescription('Loop mode')
          .setRequired(true)
          .addChoices(
            { name: 'Off', value: 'off' },
            { name: 'Track', value: 'track' },
            { name: 'Queue', value: 'queue' }
          )
      ),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;
        const mode = interaction.options.getString('mode', true) as 'off' | 'track' | 'queue';

        await global.queueManager.setLoopMode(guildId, mode);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🔁 Loop Mode Changed')
          .setDescription(`Loop mode set to: **${mode}**`);

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Loop command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to change loop mode.')
          ]
        });
      }
    }
  },

  // Autoplay command
  {
    data: new SlashCommandBuilder()
      .setName('autoplay')
      .setDescription('Toggle autoplay when queue ends')
      .addBooleanOption(option =>
        option
          .setName('enabled')
          .setDescription('Enable or disable autoplay')
          .setRequired(true)
      ),

    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();

      try {
        const guildId = interaction.guildId!;
        const enabled = interaction.options.getBoolean('enabled', true);

        await global.queueManager.setAutoplay(guildId, enabled);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('🎵 Autoplay Toggled')
          .setDescription(`Autoplay ${enabled ? 'enabled' : 'disabled'}.`);

        await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        console.error('Autoplay command error:', error);
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Error')
              .setDescription('Failed to toggle autoplay.')
          ]
        });
      }
    }
  }
];
