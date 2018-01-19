const { Client } = require("discord.js");
const auth = require("./auth.js");
const DB = require("./db.js");
const bot = new Client();

bot.auth = auth;
bot.db = new DB();

bot.db.on("ready", () => {
    module.exports = bot;
    require("./message.js")

    bot.on("ready", () => {
        console.log("Bot started. " + Object.keys(bot.db.cache).length + " entries in database.")
    })

    bot.login(bot.auth.TOKEN)
})