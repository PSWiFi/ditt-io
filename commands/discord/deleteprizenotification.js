const DB = require("../../database.js");

module.exports = {
    name: "deleteprizenotification",
    type: ["pm"],
    alias: ["dpn", "deleteprizenotif", "rpn", "removeprizenotif", "removeprizenotification"],
    permissions: "room ",
    async exec(message, args, client) {
        const rearg = args.join(" ").split(",");

        const target = toId(rearg.shift());
        if (!target) throw new ChatError("Please provide a target user.");

        if (!(await DB.getPrizeNotifUser(target))) {
            throw new ChatError("No matching entry found!");
        }

        await DB.deletePrizeNotif(target);
        message.reply("Prize notification removed!");
    }
};
