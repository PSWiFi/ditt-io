const DB = require("../../database.js");

module.exports = {
    name: "monthly",
    deferPermissionsCheck: true,
    async exec(message, args, _, __, checkPerms) {
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
            if (!CACHE?.tourDetails?.value) return;

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
    }
};
