const dotenv = require("dotenv");
const exec = require("child_process").exec;
const promisify = require("util").promisify;

const sh = promisify(exec);

dotenv.config();

const { BOT_USERNAME: username } = process.env;

const FORMATTING_CHARS = ["*", "_", "`", "~", "^", "\\"];

const DEFAULT_MESSAGE = `Hi, I'm ${username}! I'm a Bot for the WiFi room - my prefix is \`\`${config.prefix}\`\`. For support, please contact a staff member.`;
const CANNOT_BE_USED_IN_PM = "This command can only be used in a room.";

const REPLIES = [
  "Go away.",
  "Stop messaging me.",
  "piss off",
  "You're welcome!",
];

const KILL_REPLIES = [
  "So long and thanks for all the fish",
  "Bye bitches",
  "So long, farewell, auf wiedersehen, goodbye",
  "Cya later, alligator",
  "Smell ya later!",
  "I would just like to thank the wonderful staff here for there assistance in the process of installing all the necessary tools required to clone Pokemon, and the inadvertent assistance in teaching me how to hack my own mons. Ur peoples system is very broken btw and definitely needs some revamping to prevent people from doing this. I now accept my ban and will be on my way, I hope u take into consideration what I just stated and make it more difficult for this to happen in the future. Cya on the flip side",
  "Toodles poodles",
  "See you, space cowboy",
  "I'm outta here!",
  "\`\`01100111 01101111 01101111 01100100 00100000 01100010 01111001 01100101\`\`",
  "Is that the cops!? If anyone asks, I was never here...",
  "im going to mcdonalds does anyone want anything? no? ok, bye",
  "Bye felicia",
  "/me flees",
  "I'm out!,"
];

async function handleMessage(message, client, DB) {
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
    const command = args.shift().toLowerCase().trim();
    try {
      switch (command) {
        // Make sure to run a checkPerms on everything!
        // Also would recommend using checkPerms('chatvoice') for broadcasting stuff
        // since it uses the displayed rank (higher of room and global rank)
        // Also remember to add a break after every command
        // Yes I could've used modular functions but I'm lazy okay
        case "pull":
          checkPerms("roomowner");
          message.reply("Attempting git pull...");
          const remoteOutput = await sh("git remote -v").catch(e => new ChatError(e));
          if (!remoteOutput || remoteOutput.stderr) throw new ChatError("No git remote output");
          const pull = await sh("git pull").catch(e => new ChatError(e));
          if (!pull || (pull.stderr && !pull.stdout)) throw new ChatError("Could not pull origin.");
          if (pull.stdout.replace("\n", "").replace(/-/g, " ") === "Already up to date.") throw new ChatError("Already up to date!");
          message.reply("!code " + pull.stdout);
          break;

        case "kill":
        case "restart": // Technically this command ends the process, but Ditt-io's VPS has a cron job set up to instantly restart the process
          checkPerms("roommod");
          const killreplyindex = ~~(Math.random() * KILL_REPLIES.length);
          await message.reply(KILL_REPLIES[killreplyindex]);
          process.exit(0);

        case "hangman":
          checkPerms("chatvoice");
          if (message.type !== "chat")
            throw new ChatError(CANNOT_BE_USED_IN_PM);
          message.reply("/hangman random");
          break;
        
        case "aun":
        case "addusernotif":
        case "addusernotification":
          checkPerms("roomdriver");
          const target = toId(args.shift());
          if (!target) throw new ChatError(`\`\`${config.prefix}addusernotif user, reason, [discord id to ping 1, discord id to ping 2, ...]\`\``);

          if (await DB.getDiscordNotifUser(target, config.mainRoom)) {
            throw new ChatError("A discord notification already exists for this user!");
          }

          const rearg = args.join(" ").split(",");
          const reason = rearg.shift();
          if (!reason?.length) throw new ChatError("Please provide a reason for the notification.");

          let tag = ["@here"];
          if (rearg?.length) tag = rearg;
          
          await DB.createUserNotif(target, config.mainRoom, reason, tag);
          message.reply("Discord notification set up for " + target + "!");
          break;
        
        case "apn":
        case "addprizenotif":
        case "addprizenotification":
          checkPerms("roomdriver");
          const ptarget = toId(args.shift());
          if (!ptarget) throw new ChatError(`\`\`${config.prefix}addprizenotif user, note, [discord id to ping 1, discord id to ping 2, ...]\`\``);

          if (await DB.getPrizeNotifUser(ptarget)) {
            throw new ChatError("A discord notification already exists for this user!");
          }

          const prearg = args.join(" ").split(",");
          const preason = prearg.shift();
          if (!preason?.length) throw new ChatError("Please provide a note for the notification.");

          let ptag = ["&980658607769145425"];
          if (prearg?.length) ptag = prearg;
          
          await DB.createPrizeNotif(ptarget, preason, ptag);
          message.reply("Prize notification set up for " + ptarget + "!");
          break;

        case "dun":
        case "deleteusernotif":
        case "deleteusernotification":
          checkPerms("roomdriver");
          const tgt = toId(args.shift());
          if (!tgt) throw new ChatError("Please provide a target user.");

          if (!(await DB.getDiscordNotifUser(tgt, config.mainRoom))) {
            throw new ChatError("No matching entry found!");
          }

          await DB.deleteUserNotif(tgt, config.mainRoom);
          message.reply("Discord notification removed!");
          break;
        
        case "dpn":
        case "deleteprizenotif":
        case "deleteprizenotification":
          checkPerms("chat ");
          const ptgt = toId(args.shift());
          if (!ptgt) throw new ChatError("Please provide a target user.");

          if (!(await DB.getPrizeNotifUser(ptgt))) {
            throw new ChatError("No matching entry found!");
          }

          await DB.deletePrizeNotif(ptgt);
          message.reply("Prize notification removed!");
          break;
        
        case "gun":
        case "gaun":
        case "getusernotifs":
        case "getusernotifications":
        case "getallusernotifs":
        case "getallusernotifications":
          checkPerms("roomdriver");
          var notfs = [...await DB.getAllDiscordNotifs()].map(e => e._id.split("-")[1]);
          message.reply(`Got ${notfs.length} entr${notfs.length === 1 ? "y" : "ies"}: ${notfs.join(", ")}`);
          break;
        
        case "gpn":
        case "gapn":
        case "getprizenotifs":
        case "getprizenotifications":
        case "getallprizenotifs":
        case "getallprizenotifications":
          checkPerms("roomdriver");
          var pnotfs = [...await DB.getAllPrizeNotifs()].map(e => e._id);
          message.reply(`Got ${pnotfs.length} prize entr${pnotfs.length === 1 ? "y" : "ies"}: ${pnotfs.join(", ")}`);
          break;

        // We're using both addwp and addhwp as the same command; the line
        // with useHelperPoints is what makes them slightly different
        case "addwp":
        case "addhwp":
        case "addpp":
        case "addrizz":
        case "removepp":
        case "removewp":
        case "removehwp":
        case "removerizz":
          checkPerms("chatvoice");
          // Remove the next line if you want to let staff use this in DMs
          if (message.type !== "chat")
            throw new ChatError(CANNOT_BE_USED_IN_PM);
          let rizz = command.includes("rizz");
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
          const useHelperPoints = command.includes("hwp");
          const remove = command.includes("remove") || amt < 0;
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
            `${Math.abs(amt)} ${rizz ? "rizz" : "point"}${
              Math.abs(amt) === 1 || rizz ? "" : "s"
            } ${remove ? "removed from" : "awarded to"} ${users.join(", ")}.`
          );
          break;

        case "wp":
        case "viewwp":
        case "rizz":
        case "viewrizz":
          if (message.type === "chat") checkPerms("chatvoice");
          let rz = command.includes("rizz");
          const user = args.length
            ? toId(args.join(""))
            : message.author.userid;
          try {
            const {
              name,
              points: [wp, hp = 0],
            } = await DB.getPoints(user);
            if (rz) {
              message.reply(`${name} has ${wp + hp} rizz.`);
            } else {
              message.reply(
                `${name} has ${wp + hp} point${
                  Math.abs(wp + hp) === 1 ? "" : "s"
                }${hp ? ` - ${wp}WP and ${hp}HWP` : ""}.`
              );
            }
          } catch (err) {
            throw new ChatError(
              `That user doesn't have any ${rz ? "rizz" : "points"}...`
            );
          }
          break;

        case "reset":
        case "resetwp":
        case "fanumtax":
          checkPerms("roomdriver"); // Maybe make this roommod? Perms are up to you
          // Remove the next line if you want to let staff use this in DMs
          if (message.type !== "chat")
            throw new ChatError(CANNOT_BE_USED_IN_PM);
          message.reply(
            "Are you sure you want to reset the leaderboard? Type 'confirm' to confirm within the next 10 seconds."
          );
          try {
            await message.target.waitFor((msg) => {
              return (
                msg.author.userid === message.author.userid &&
                toId(msg.content) === "confirm"
              );
            }, 10_000);
            message.reply("Resetting points, please wait...");
            await DB.resetPoints(config.mainRoom, [15, 0]);
            message.reply("Points have been reset!");
          } catch {
            message.reply("Time expired.");
          }
          break;

        case "monthly":
          if (message.type === "pm") {
            // Set the value of the monthly
            checkPerms("roommod");
            const tourDetails = args.join(" ").trim();
            if (!tourDetails)
              throw new ChatError("Please provide a format for the tour.");
            let tmp = tourDetails.split(",");
            const format = tmp.shift();
            const rules = tmp.join(", ");
            CACHE.tourDetails = tourDetails;
            DB.setTourDetails(tourDetails);
            message.reply(
              `Set monthly tour to: \`\`${format}\`\`. Please ensure there are no typos in the format string or creating the tour will fail!`
            );
            if (rules?.length > 0) message.reply(`Added rules: ${rules}`);
          } else if (message.type === "chat") {
            // Creating a monthly tour
            checkPerms("roomvoice");
            if (!CACHE?.tourDetails?.value)
              CACHE.tourDetails = await DB.getTourDetails();
            if (!CACHE?.tourDetails?.value) break;

            let tmp = CACHE.tourDetails.value.split(",");
            const format = tmp.shift();
            const rules = tmp.join(", ");

            message.reply(
              `/modnote Attempting to create a ${format} tour. If it is unsuccessful, please verify the format is valid and get a Room Owner or higher to re-set it by using ${config.prefix}monthly FormatName in PMs with the bot.`
            );
            message.reply(`/tour create ${format}, elimination`);
            if (rules?.length > 0) message.reply(`/tour rules ${rules}`);
            message.reply("/tour autostart 5");
            message.reply("/tour autodq 2");
            message.reply("/tour scouting disallow");
          }
          break;

        case "say":
          if (!config.developers.includes(message.author.userid))
            checkPerms("roomowner");
          message.reply(args.join(" "));
          break;

        case "sayroom":
          if (!config.developers.includes(message.author.userid))
            throw new ChatError("You lack permission to use this command.");
          let room = toId(args.shift());
          if (!room || !args.length)
            throw new ChatError(
              `\`\`${config.prefix}sayroom room, message or command\`\``
            );
          client.send(`${room}|${args.join(" ").trim()}`);
          break;
        
        case "verify":
          if (!args.length) throw new ChatError(
            `\`\`${config.prefix}verify code\`\``
          );
          const code = args[0];
          const res = await DB.verifyLinkUser(message.author.userid, code);
          if (res === 3) {
            return message.reply("Your account is already linked!");
          } else if (res === 2) {
            // Success
            return message.reply("Verification success! Please use ``/linkuser`` one more time on discord to complete the process.");
          } else if (res === 1) {
            // Wrong code
            return message.reply("Incorrect verification code! Could not link user.");
          }
          else {
            // No entry found
            return message.reply("Please use ``/linkuser`` with our discord bot to get started.");
          }
          break;

        case "uptime":
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
              `${mins} minute${mins === 1 ? "" : "s"} and ${secs} second${
                secs === 1 ? "" : "s"
              }`,
            ];
          } else {
            str = [`${secs} second${secs === 1 ? "" : "s"}`];
          }

          message.reply(`${username} uptime: ${str.join(", ")}`);
          break;

        case "rejoin":
        case "rj":
          for (const room of config.rooms) {
            client.send("|/j " + room);
          }
          break;

        default:
          throw new ChatError(DEFAULT_MESSAGE);
      }
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
