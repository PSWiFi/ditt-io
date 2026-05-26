const DB = require("../../database.js");

module.exports = {
    name: "addwp",
    type: ["chat"],
    alias: ["addhwp", "addpp", "addrizz", "removewp", "removehwp", "removepp", "removerizz"],
    permissions: "chatvoice",
    async exec(message, args, _, commandName) {
        // We're using both addwp and addhwp as the same command; the line
        // with useHelperPoints is what makes them slightly different
        let rizz = commandName.includes("rizz");
        const params = args
            .join(" ")
            .split(",")
            .map((param) => param.trim());
        let [amt, ...extra] = params.filter((param) => /^-?\d+$/.test(param));
        if (extra.length)
            throw new ChatError(
                `Please provide only 1 number (received: ${extra + 1})`
            );
        // You can also make this '1' or something instead
        if (!amt || parseInt(amt) === 0)
            throw new ChatError("Please provide the number of points to add.");
        const users = params.filter((param) => /[a-z]/i.test(param));
        const useHelperPoints = commandName.includes("hwp");
        const remove = commandName.includes("remove") || amt < 0;
        if (remove) amt = Math.abs(amt) * -1;
        await Promise.all(
            users.map((user) =>
                DB.addPoints(
                    user,
                    config.mainRoom,
                    parseInt(amt),
                    useHelperPoints ? 1 : 0,
                    useHelperPoints ? 150 : 10_000
                )
            )
        );
        // TODO: Probably make this a Promise.allSettled and display results instead
        // await DB.bulkAddPoints(users, config.mainRoom, parseInt(amt));
        message.reply(
            `${Math.abs(amt)} ${rizz ? "rizz" : "point"}${Math.abs(amt) === 1 || rizz ? "" : "s"
            } ${remove ? "removed from" : "awarded to"} ${users.join(", ")}.`
        );
    }
};
