const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
} = require("discord.js");
const schedule = require("node-schedule");
const tradingTips = require("./tips.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 📁 Load commands
client.commands = new Collection();
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// ✅ Bot ready
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ⏱️ Send random trading tip every hour
  schedule.scheduleJob("0 * * * *", () => {
    sendDailyTip("1362258860319969333"); // tip channel ID
  });
});

// 📤 Daily tip sender
function sendDailyTip(channelId) {
  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isTextBased()) return;
  const tip = tradingTips[Math.floor(Math.random() * tradingTips.length)];
  channel.send(tip).catch(console.error);
}
client.sendDailyTip = sendDailyTip;

// 💬 Listen to message commands
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error("❌ Command Error:", error);
    message.reply("❌ There was an error executing that command.");
  }
});

// 👋 Auto welcome + role assignment
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get("1400997356144431255");
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(0xfcd34d)
    .setTitle("🌟 Welcome to SqueezeX Trading! 🌟")
    .setDescription(
      `Welcome to **SqueezeX Trading**! 🚀 Glad to have you here, <@${member.id}>!\n\nFeel free to look around, introduce yourself, and let’s grow together. Happy trading! 📈🔥`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });

    const role = member.guild.roles.cache.get("1401009263593263175");
    if (role) {
      await member.roles.add(role);
      console.log(`✅ Assigned role "${role.name}" to ${member.user.tag}`);
    } else {
      console.log("❌ Role not found");
    }
  } catch (err) {
    console.error("❌ Error assigning role or sending welcome:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
