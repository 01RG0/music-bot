import { Interaction, ChatInputCommandInteraction, ButtonInteraction } from 'discord.js';
import { commands } from '../commands';

const commandMap = new Map();
commands.forEach(command => {
  commandMap.set(command.data.name, command);
});

export async function handleInteractionCreate(interaction: Interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      await handleChatInputCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('Interaction error:', error);

    if (interaction.isRepliable() && !interaction.replied) {
      try {
        await interaction.reply({
          content: 'An error occurred while processing your request.',
          ephemeral: true
        });
      } catch {
        // Ignore errors if we can't reply
      }
    }
  }
}

async function handleChatInputCommand(interaction: ChatInputCommandInteraction) {
  const command = commandMap.get(interaction.commandName);

  if (!command) {
    console.error(`Command not found: ${interaction.commandName}`);
    return;
  }

  // Check permissions if needed
  if (command.data.default_member_permissions) {
    const member = interaction.member;
    if (!member || typeof member.permissions === 'string') return;

    const hasPermission = member.permissions.has(command.data.default_member_permissions);
    if (!hasPermission) {
      return await interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true
      });
    }
  }

  await command.execute(interaction);
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
  const [action, ...params] = interaction.customId.split('_');

  switch (action) {
    case 'queue':
      await handleQueueButton(interaction, params);
      break;
    default:
      console.log(`Unknown button action: ${action}`);
  }
}

async function handleQueueButton(interaction: ButtonInteraction, params: string[]) {
  const [direction, currentPageStr] = params;
  const currentPage = parseInt(currentPageStr);

  if (direction === 'prev' && currentPage > 1) {
    // Handle previous page
    await interaction.update({
      content: `Queue page ${currentPage - 1} (this would be implemented)`,
      embeds: [],
      components: []
    });
  } else if (direction === 'next') {
    // Handle next page
    await interaction.update({
      content: `Queue page ${currentPage + 1} (this would be implemented)`,
      embeds: [],
      components: []
    });
  }
}
