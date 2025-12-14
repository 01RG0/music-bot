import { ChatInputCommandInteraction } from 'discord.js';
export declare const filterCommands: ({
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
} | {
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<import("discord.js").Message<boolean> | undefined>;
})[];
//# sourceMappingURL=filters.d.ts.map