module.exports = {
  name: "tip",
  description: "Send a daily trading tip to the channel.",
  execute(message, args, client) {
    client.sendDailyTip(message.channel.id);
  },
};
