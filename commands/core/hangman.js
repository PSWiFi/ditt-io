module.exports = {
    name: "hangman",
    type: ["chat"],
    permissions: "chatvoice",
    async exec(message, args, client) {
        message.reply("/hangman random");
    }
};
