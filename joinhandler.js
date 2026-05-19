const dotenv = require("dotenv");
const https = require("https");

dotenv.config();

const { DISCORD_WEBHOOK_URL: url, BOT_USERNAME: username } = process.env;

async function handleJoin(room, user, isIntro, DB) {
  if (isIntro || !url?.length) return;

  var entry = await DB.getDiscordNotifUser(user, room);
  if (entry) {
    const tag = entry.ping;
    const tags = [];
    for (let i = 0; i < tag.length; i++) {
      let t = tag[i].trim();
      if (t === "@here") tags.push(t);
      else {
        tags.push(`<@${toId(t)}>`);
      }
    }

    const reason = entry.reason;
    const ping = tags.join(" ");
    const time = +(new Date());

    if (time - entry.lastSent < (30 * 60 * 60 * 1000)) return;
    entry.lastSent = time;
    await entry.save();

    const user = entry._id.split("-")[1];
    const content = `**${user}** is online in the Wi-Fi room! Pinglist for this user: ${ping}\n**Alert reason**: ${reason}\n_You can disable future notifications for this user by sending_ \`\`/w dittio, ${config.prefix}deleteusernotif ${user}\`\` _on PS!_`;
    sendWebhook(content);
  }
}

function sendWebhook(content) {
  const payload = JSON.stringify({
    content: content,
    username: username,
    avatar_url: "https://play.pokemonshowdown.com/sprites/trainers-custom/dittio.png",
  });

 const options = {
    hostname: 'discord.com',
    port: 443,
    path: url,
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