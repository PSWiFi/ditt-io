const commandHandler = require("./commandhandler.js");
const DB = require("./database.js");
const dotenv = require("dotenv");

let commands;

dotenv.config();

const { BOT_USERNAME: username } = process.env;

const FORMATTING_CHARS = ["*", "_", "`", "~", "^", "\\"];

const DEFAULT_MESSAGE = `Hi, I'm ${username}! I'm a Bot for the WiFi room - my prefix is \`\`${config.prefix}\`\`. For support, please contact a staff member.`;
const CANNOT_BE_USED_IN_PM = "This command can only be used in a room.";
const CAN_ONLY_BE_USED_IN_PM = "This command can only be used in private messages.";

const REPLIES = [
  "Go away.",
  "Stop messaging me.",
  "piss off",
  "You're welcome!",
];

async function handleMessage(message, client) {
  if (!commands) {
    console.log("Loading commands...");
    commands = await commandHandler.loadCommandsDirectory();
    console.log("Commands loaded!");
  }

  if (message.author?.name) {
    if (message.isIntro || message.author?.name === client.status.username)
      return;
    if (message.content === "%...%")
      console.log(message, message.author, message.target);

    if (!message.content.startsWith(config.prefix)) {
      if (message.type === "pm" && message.author?.name)
        if (["thank you", "ty", "thanks"].includes(message.content.toLowerCase().trim())) {
          const idx = ~~(Math.random() * (REPLIES.length + 20));
          message.reply(idx < 3 ? REPLIES[idx] : REPLIES[3]);
        } else {
          message.reply(DEFAULT_MESSAGE);
        }
      return;
    }

    if (
      FORMATTING_CHARS.includes(config.prefix) &&
      message.content.startsWith(config.prefix.repeat(2))
    )
      return; // Don't try and interpret formatting as a command

    if (
      message.command === "/raw" &&
      message.content?.includes("</span> sent you a friend request!")
    )
      return;

    const checkPerms = getCheckPerms(message);
    const args = message.content.substr(config.prefix.length).split(" ");
    const commandName = args.shift().toLowerCase().trim();

    try {
      const command = commandHandler.get(commandName, commands);
      if (!command) throw new ChatError(DEFAULT_MESSAGE);
      if (command.disabled) throw new ChatError("The requested command is currently disabled.");
      if (command.type && !command.type.includes(message.type) && !config.developers.includes(message.author.userid)) {
        if (!command.type.includes("pm") && message.type === "pm") throw new ChatError(CANNOT_BE_USED_IN_PM);
        if (!command.type.includes("chat") && message.type === "chat") throw new ChatErro(CAN_ONLY_BE_USED_IN_PM);
      }
      if (!command.deferPermissionsCheck) {
        if (command.permissions) checkPerms(command.permissions);
      }
      await command.exec(message, args, client, commandName, checkPerms);
    } catch (err) {
      message.reply(err.message);
      if (err.name !== "ChatError") console.log(err, err.name);
    }
  }
}

// You shouldn't need to touch the stuff below this

function getCheckPerms(message) {
  const rankMap = {
    "‽": -2,
    "!": -1,
    " ": 0,
    "^": 0.5,
    "+": 1,
    "§": 1.5,
    "*": 3,
    "%": 2,
    "@": 3,
    "~": 4,
    "#": 5,

    "⛵": 1,
  };
  const aliases = {
    voice: "+",
    driver: "%",
    mod: "@",
    moderator: "@",
    bot: "*",
    owner: "#",
    ro: "#",
    admin: "~",
  };
  function aliasRank(rank) {
    if (aliases[rank]) return aliases[rank];
    else return rank;
  }
  function getRank(rank) {
    return rankMap[aliasRank(rank)] ?? 0;
  }
  return function checkPerms(rankString, throwErr = true) {
    if (config.developers.includes(message.author.id)) return true; // devs bypass permission checks
    if (!rankString) throw new Error("Must pass a rank to checkPerms");
    rankString = rankString.toLowerCase().replace(/ /g, "");
    const rankRegex = /^(?:room|chat|global)/;
    const level = rankString.match(rankRegex)?.toString();
    if (!level) throw new Error("Rank must start with room/chat");
    // 'room' checks for roomauth, 'chat' uses the rank shown in chat, 'global' uses the global rank
    const rank = rankString.replace(rankRegex, "");
    const requiredRank = getRank(rank);
    const room = config.mainRoom; // You can use message.target.roomid if you want to use this elsewhere
    const actualRank = getRank(
      level === "room"
        ? Object.entries(message.parent.rooms.get(room)?.auth ?? {}).find(
          ([sym, list]) => {
            return list.includes(message.author.userid);
          }
        )?.[0]
        : level === "chat"
          ? message.msgRank
          : level === "global"
            ? message.author.group
            : null
    );
    if (actualRank >= requiredRank) return true;
    if (throwErr) throw new ChatError("Insufficient permissions");
    return false;
  };
}

module.exports = {
  handleMessage,
};
