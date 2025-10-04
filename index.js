const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let trackedWords = ["word1", "word2", "word3"]; // Change to your tracked words
let userCounts = {};

if (fs.existsSync("users.json")) {
    userCounts = JSON.parse(fs.readFileSync("users.json"));
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    let foundWord = false;
    trackedWords.forEach(word => {
        let regex = new RegExp(word, "i");
        if (regex.test(message.content)) {
            foundWord = true;
        }
    });

    if (foundWord) {
        let userId = message.author.id;
        userCounts[userId] = (userCounts[userId] || 0) + 1;
        fs.writeFileSync("users.json", JSON.stringify(userCounts, null, 2));
    }

    if (message.content.toLowerCase() === "!leaderboard") {
        let sorted = Object.entries(userCounts)
            .sort((a,b) => b[1] - a[1])
            .map(([userId, count], i) => `${i+1}. <@${userId}> — ${count} words`);

        message.channel.send("**Leaderboard:**\n" + sorted.join("\n"));
    }
});

client.login(process.env.TOKEN);
