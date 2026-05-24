const DB = require("../../database.js");

module.exports = {
    name: "getusernotifications",
    type: ["pm"],
    alias: ["gun", "gaun", "getusernotifs", "getallusernotifs", "getallusernotifications"],
    permissions: "roomdriver",
    async exec(message, args, client) {
        var users = [...await DB.getAllDiscordNotifs()].map(e => e._id.split("-")[1]);
        if (!users.length) message.reply("No entries found!");    
        else message.reply(`Got ${users.length} entr${users.length === 1 ? "y" : "ies"}: ${users.join(", ")}`);
    }
};
