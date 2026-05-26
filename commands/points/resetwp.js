const DB = require("../../database.js");

module.exports = {
    name: "resetwp",
    type: ["chat"],
    alias: ["reset", "fanumtax"],
    permissions: "roomdriver",
    async exec(message) {
        message.reply(
            "Are you sure you want to reset the leaderboard? Type ``confirm`` within the next 10 seconds to proceed."
        );
        try {
            await message.target.waitFor((msg) => {
                return (
                    msg.author.userid === message.author.userid &&
                    toId(msg.content) === "confirm"
                );
            }, 10_000);
            message.reply("Resetting points, please wait...");
            await DB.resetPoints(config.mainRoom, [15, 0]);
            message.reply("Points have been reset!");
        } catch {
            message.reply("Time expired.");
        }
    }
};
