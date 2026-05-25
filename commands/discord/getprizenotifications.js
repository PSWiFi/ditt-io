const DB = require("../../database.js");

module.exports = {
    name: "getprizenotifications",
    type: ["pm"],
    alias: ["gpn", "gapn", "getprizenotifs", "getallprizenotifs", "getallprizenotifications"],
    permissions: "roomdriver",
    async exec(message) {
        var users = [...await DB.getAllPrizeNotifs()].map(e => e._id);
        if (!users.length) message.reply("No entries found!");   
        message.reply(`Got ${users.length} prize entr${users.length === 1 ? "y" : "ies"}: ${users.join(", ")}`); 
    }
};
