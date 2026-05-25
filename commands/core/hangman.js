module.exports = {
    name: "hangman",
    type: ["chat"],
    permissions: "chatvoice",
    async exec(message) {
        message.reply("/hangman random");
    }
};
