const DB = require("../../database.js");

module.exports = {
    name: "verify",
    type: ["pm"],
    disabled: true,
    async exec(message, args) {
        if (!args.length) throw new ChatError(
            `\`\`${config.prefix}verify code\`\``
        );
        const code = args[0];
        const res = await DB.verifyLinkUser(message.author.userid, code);
        if (res === 3) {
            return message.reply("Your account is already linked!");
        } else if (res === 2) {
            // Success
            return message.reply("Verification success! Please use ``/linkuser`` one more time on discord to complete the process.");
        } else if (res === 1) {
            // Wrong code
            return message.reply("Incorrect verification code! Could not link user.");
        }
        else {
            // No entry found
            return message.reply("Please use ``/linkuser`` with our discord bot to get started.");
        }
    }
};
