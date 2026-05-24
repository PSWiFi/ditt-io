module.exports = {
    name: "rejoin",
    type: ["pm", "chat"],
    alias: ["rj"],
    async exec(message, args, client) {
        for (const room of config.rooms) {
            client.send("|/j " + room);
        }
    }
};
