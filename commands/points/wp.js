const DB = require("../../database.js");

module.exports = {
    name: "wp",
    alias: ["viewwp", "rizz", "viewrizz"],
    permissions: "chatvoice",
    deferPermissionsCheck: true,
    async exec(message, args, _, commandName, checkPerms) {
        if (message.type === "chat") checkPerms("chatvoice");
        let rizz = commandName.includes("rizz");
        const user = args.length
            ? toId(args.join(""))
            : message.author.userid;
        try {
            const {
                name,
                points: [wp, hp = 0],
            } = await DB.getPoints(user);
            if (rizz) {
                message.reply(`${name} has ${wp + hp} rizz.`);
            } else {
                message.reply(
                    `${name} has ${wp + hp} point${Math.abs(wp + hp) === 1 ? "" : "s"
                    }${hp ? ` - ${wp}WP and ${hp}HWP` : ""}.`
                );
            }
        } catch (err) {
            throw new ChatError(
                `That user doesn't have any ${rizz ? "rizz" : "points"}...`
            );
        }
    }
};
