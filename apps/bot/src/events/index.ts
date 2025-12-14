import { Client, Events, Interaction, VoiceState } from 'discord.js';
import { handleInteractionCreate } from './interactionCreate';
import { handleVoiceStateUpdate } from './voiceStateUpdate';
import { handleReady } from './ready';

export function setupEventHandlers(client: Client) {
  // Ready event
  client.on(Events.ClientReady, handleReady);

  // Interaction handler
  client.on(Events.InteractionCreate, handleInteractionCreate);

  // Voice state updates
  client.on(Events.VoiceStateUpdate, handleVoiceStateUpdate);

  // Error handling
  client.on(Events.Error, (error) => {
    console.error('Discord client error:', error);
  });

  client.on(Events.Warn, (warning) => {
    console.warn('Discord client warning:', warning);
  });

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    client.on(Events.Debug, (info) => {
      console.debug('Discord debug:', info);
    });
  }
}
