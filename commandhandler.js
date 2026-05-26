const fs = require("fs");
const path = require("path");

const commandsDirectory = path.join(__dirname, "commands");

async function loadCommandsDirectory(dir = commandsDirectory) { 
    const commands = {};
    for await (const file of getFiles(dir)) { 
        try {
            if (!file.endsWith(".js")) continue;
            const command = require(file);
            const commandName = command.name;
            if (commandName !== toId(commandName)) {
                console.log(`${commandName} is not a valid command name! Skipping...`);
                continue;
            }
            if (get(commandName, commands)) {
                console.log(`${commandName} is already defined or has an overlapping alias! Skipping...`);
                continue;
            }
            if (command.alias) {
                let found = false;
                for (const alias of command.alias) {
                    if (get(alias, commands)) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    console.log(`${commandName} has an alias that exists on another command! Skipping...`);
                    continue;
                }
            }

            commands[commandName] = command;
        } catch (e) { 
            console.error("Something went wrong while loading " + file);
            console.error(e);
        };
    }
    return commands;
}

function get(command, commands, searchAliases = true) { 
    if (commands[command]) return commands[command];
    if (!searchAliases) return null;
    for (const c of Object.keys(commands)) { 
        const cmd = commands[c];
        const a = cmd.alias ?? [];
        if ([c, ...a].includes(command)) return cmd;
    }
    return null;
}

async function* getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for(const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

module.exports = {
    loadCommandsDirectory,
    get,
};

