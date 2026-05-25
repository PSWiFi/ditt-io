const exec = require("child_process").exec;
const promisify = require("util").promisify;

const sh = promisify(exec);

module.exports = {
    name: "pull",
    permissions: "roomowner",
    type: ["pm", "chat"],
    async exec(message) {
        message.reply("Attempting git pull...");

        const remoteOutput = await sh("git remote -v").catch(e => new ChatError(e));
        if (!remoteOutput || remoteOutput.stderr) throw new ChatError("No git remote output");

        const pull = await sh("git pull").catch(e => new ChatError(e));
        if (!pull || (pull.stderr && !pull.stdout)) throw new ChatError("Could not pull origin.");

        if (pull.stdout.replace("\n", "").replace(/-/g, " ") === "Already up to date.") throw new ChatError("Already up to date!");
        message.reply("!code " + pull.stdout);
    }
}
