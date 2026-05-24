const dotenv = require("dotenv");

dotenv.config();

const { BOT_USERNAME: username } = process.env;

module.exports = {
    name: "uptime",
    type: ["pm", "chat"],
    async exec(message, args, client) {
        const time = Math.floor(process.uptime());

        let hours = Math.floor(time / 3600);
        const mins = Math.floor((time - hours * 3600) / 60);
        const secs = Math.floor(time - hours * 3600 - mins * 60);
        const days = Math.floor(time / (60 * 60 * 24));
        hours = hours % 24;

        let str;
        if (days > 0) {
            str = [
                `${days} day${days === 1 ? "" : "s"}`,
                `${hours} hour${hours === 1 ? "" : "s"}`,
                `${mins} minute${mins === 1 ? "" : "s"}`,
                `and ${secs} second${secs === 1 ? "" : "s"}`,
            ];
        } else if (hours > 0) {
            str = [
                `${hours} hour${hours === 1 ? "" : "s"}`,
                `${mins} minute${mins === 1 ? "" : "s"}`,
                `and ${secs} second${secs === 1 ? "" : "s"}`,
            ];
        } else if (mins > 0) {
            str = [
                `${mins} minute${mins === 1 ? "" : "s"} and ${secs} second${secs === 1 ? "" : "s"
                }`,
            ];
        } else {
            str = [`${secs} second${secs === 1 ? "" : "s"}`];
        }

        message.reply(`${username} uptime: ${str.join(", ")}`);
    }
};
