const DB = require("../../database.js");

module.exports = {
    name: "addusernotification",
    type: ["pm"],
    alias: ["aun", "addusernotif"],
    permissions: "roomdriver",
    async exec(message, args) {
        const rearg = args.join(" ").split(",");

        const target = toId(rearg.shift());
        if (!target) throw new ChatError(`\`\`${config.prefix}addusernotif user, reason, [discord id to ping 1, discord id to ping 2, ...]\`\``);

        if (await DB.getDiscordNotifUser(target, config.mainRoom)) {
            throw new ChatError("A discord notification already exists for this user!");
        }

        const reason = rearg.shift();
        if (!reason?.length) throw new ChatError("Please provide a reason for the notification.");

        let tag = ["@here"];
        if (rearg?.length) tag = rearg;

        await DB.createUserNotif(target, config.mainRoom, reason, tag);
        message.reply("Discord notification set up for " + target + "!");
    }
};
