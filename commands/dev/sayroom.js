module.exports = {
    name: "sayroom",
    type: ["pm", "chat"],
    async exec(message, args, client) {
        if (!config.developers.includes(message.author.userid))
            throw new ChatError("You lack permission to use this command.");
        let room = toId(args.shift());
        if (!room || !args.length)
            throw new ChatError(
                `\`\`${config.prefix}sayroom room, message or command\`\``
            );
        client.send(`${room}|${args.join(" ").trim()}`);
    }
}

