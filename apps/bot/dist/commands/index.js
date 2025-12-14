import { REST, Routes } from 'discord.js';
import { botConfig } from '@music/config';
import { playCommand } from './play';
import { queueCommand } from './queue';
import { controlCommands } from './controls';
import { filterCommands } from './filters';
import { settingsCommand } from './settings';
const commands = [
    playCommand,
    queueCommand,
    ...controlCommands,
    ...filterCommands,
    settingsCommand
];
export async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(botConfig.token);
    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(Routes.applicationCommands(botConfig.clientId), { body: commands });
        console.log(`✅ Registered ${commands.length} commands`);
    }
    catch (error) {
        console.error('❌ Failed to register commands:', error);
        throw error;
    }
}
export { commands };
//# sourceMappingURL=index.js.map