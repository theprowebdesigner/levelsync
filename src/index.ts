import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { createServer } from "http";

const {
  DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID,
} = process.env;

if (!DISCORD_BOT_TOKEN) {
  throw new Error("Missing DISCORD_BOT_TOKEN");
}

if (!DISCORD_CLIENT_ID) {
  throw new Error("Missing DISCORD_CLIENT_ID");
}

// --------------------
// Discord client
// --------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// --------------------
// Slash commands
// --------------------

const commands = [
  new SlashCommandBuilder()
    .setName("health")
    .setDescription("Check whether LevelSync is online"),

  new SlashCommandBuilder()
    .setName("setxp")
    .setDescription("Set a user's XP")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("xp")
        .setDescription("XP amount")
        .setRequired(true)
        .setMinValue(0)
    ),
].map(command => command.toJSON());

// --------------------
// Register commands
// --------------------

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

  await rest.put(
    Routes.applicationCommands(DISCORD_CLIENT_ID),
    { body: commands }
  );

  console.log("✅ Slash commands registered");
}

// --------------------
// Interactions
// --------------------

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command: ChatInputCommandInteraction = interaction;

  if (command.commandName === "health") {
    await command.reply("🟢 LevelSync is online!");
    return;
  }

  if (command.commandName === "setxp") {
    const user = command.options.getUser("user", true);
    const xp = command.options.getInteger("xp", true);

    await command.reply(
      `✅ XP for **${user.username}** has been set to **${xp}**.`
    );

    console.log(`Set XP: ${user.id} → ${xp}`);
  }
});

// --------------------