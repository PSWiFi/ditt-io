const dotenv = require("dotenv");
const https = require("https");
const DB = require("./database.js");

dotenv.config();

const { DISCORD_WEBHOOK_URL: url, PRIZES_WEBHOOK_URL: pz_url, BOT_USERNAME: username } = process.env;

async function handleJoin(room, user, isIntro) {
  if (isIntro) return;

  const time = +(new Date());

  var entry = await DB.getDiscordNotifUser(user, room);
  if (entry && url.length) {
    if (time - entry.lastSent < (30 * 60 * 60 * 1000)) return;
    entry.lastSent = time;
    await entry.save();

    const tag = entry.ping;
    const tags = [];
    for (let i = 0; i < tag.length; i++) {
      let t = tag[i].trim();
      let hasAmp = t.startsWith("&");
      if (t === "@here") tags.push(t);
      else {
        tags.push(`<@${hasAmp ? "&" : ""}${toId(t)}>`);
      }
    }

    const reason = entry.reason;
    const ping = tags.join(" ");

    const user = entry._id.split("-")[1];
    const content = `**${user}** is online in the ${room} room! Pinglist for this user: ${ping}\n**Alert reason**: ${reason}\n_You can disable discord notifications for this user by sending_ \`\`/w dittio, ${config.prefix}deleteusernotif ${user}\`\` _on PS!_`;
    sendWebhook(content, url);
  }

  var pz_entry = await DB.getPrizeNotifUser(user);
  if (room === "wifi" && pz_entry && pz_url.length) {
    if (time - pz_entry.lastSent < (30 * 60 * 60 * 1000)) return;
    pz_entry.lastSent = time;
    await pz_entry.save();

    const tag = pz_entry.ping;
    const tags = [];
    for (let i = 0; i < tag.length; i++) {
      let t = tag[i].trim();
      let hasAmp = t.startsWith("&");
      tags.push(`<@${hasAmp ? "&" : ""}${toId(t)}>`);
    }

    const reason = pz_entry.reason;
    const ping = tags.join(" ");

    const user = pz_entry._id;
    const content = `**${user}** is online in the Wi-Fi room! Pinglist for this user: ${ping}\n**Note**: ${reason}\n_You can disable prize notifications for this user by sending_ \`\`/w dittio, ${config.prefix}deleteprizenotif ${user}\`\` _on PS!_`;
    sendWebhook(content, pz_url);
  }
}

function sendWebhook(content, path) {
  const payload = JSON.stringify({
    content: content,
    username: username,
    avatar_url: "https://play.pokemonshowdown.com/sprites/trainers-custom/dittio.png",
  });

 const options = {
    hostname: 'discord.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
  };

  // Create the request
  const req = https.request(options, (res) => {
      let data = '';
        res.on('data', (chunk) => {
          data += chunk; // Concatenate data chunks
      });
  });
  
  // Handle potential errors during the request
  req.on('error', (err) => {
      console.error(`Error: ${err.message}`);
  });
  
  // Write the data to the request body and end the request
  req.write(payload);
  req.end();
}

module.exports = {
  handleJoin,
};