module.exports = {
  name: "say",
  permissions: "roomowner",
  type: ["pm", "chat"],
  async exec(message, args, client) {
    message.reply(args.join(" "));
  }
};
