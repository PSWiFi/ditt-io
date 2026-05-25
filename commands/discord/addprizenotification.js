const DB = require("../../database.js");

module.exports = {
    name: "addprizenotification",
    type: ["pm"],
    alias: ["apn", "addprizenotif"],
    permissions: "roomdriver",
    async exec(message, args) {
        const rearg = args.join(" ").split(",");

        const target = toId(rearg.shift());
        if (!target) throw new ChatError(`\`\`${config.prefix}addprizenotif user, note, [discord id to ping 1, discord id to ping 2, ...]\`\``);

        if (await DB.getPrizeNotifUser(target)) {
            throw new ChatError("A prize notification already exists for this user!");
        }

        const reason = rearg.shift();
        if (!reason?.length) throw new ChatError("Please provide a note for the notification.");

        let ptag = ["&980658607769145425"];
        if (rearg?.length) ptag = rearg;

        await DB.createPrizeNotif(target, reason, ptag);
        message.reply("Prize notification set up for " + target + "!");
    }
};
