module.exports = {
    name: "rejoin",
    type: ["pm", "chat"],
    alias: ["rj"],
    async exec(_, __, client) {
        for (const room of config.rooms) {
            await client.send("|/j " + room);
        }
    }
};
