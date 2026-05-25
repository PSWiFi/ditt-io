const DB = require("../../database.js");

module.exports = {
    name: "deleteusernotification",
    type: ["pm"],
    alias: ["dun", "deleteusernotif", "run", "removeusernotif", "removeusernotification"],
    permissions: "roomdriver",
    async exec(message, args) {
        const rearg = args.join(" ").split(",");

        const target = toId(rearg.shift());
        if (!target) throw new ChatError("Please provide a target user.");

        if (!(await DB.getDiscordNotifUser(target, config.mainRoom))) {
            throw new ChatError("No matching entry found!");
        }

        await DB.deleteUserNotif(target, config.mainRoom);
        message.reply("Discord notification removed!");
    }
};
