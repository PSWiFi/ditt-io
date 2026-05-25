const KILL_REPLIES = [
    "So long and thanks for all the fish",
    "Bye bitches",
    "so long, farewell, auf wiedersehen, goodbye~",
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

module.exports = {
    name: "kill",
    alias: ["restart"], // Technically this command ends the process, but Ditt-io's VPS has a cron job set up to instantly restart the process
    permissions: "roommod",
    type: ["pm", "chat"],
    async exec(message) {
        const i = ~~(Math.random() * KILL_REPLIES.length);
        await message.reply(KILL_REPLIES[i]);
        console.log("Shutting down...");
        process.exit(0);
    }
}