module.exports = {
  name: "say",
  permissions: "roomowner",
  type: ["pm", "chat"],
  async exec(message, args) {
    message.reply(args.join(" "));
  }
};
