declare const commands: ({
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: import("discord.js").ChatInputCommandInteraction): Promise<import("discord.js").Message<boolean> | undefined>;
} | {
    data: import("discord.js").SlashCommandOptionsOnlyBuilder;
    execute(interaction: import("discord.js").ChatInputCommandInteraction): Promise<void>;
} | {
    data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: import("discord.js").ChatInputCommandInteraction): Promise<void>;
})[];
export declare function registerCommands(): Promise<void>;
export { commands };
//# sourceMappingURL=index.d.ts.map