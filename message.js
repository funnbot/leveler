const {
    RichEmbed
} = require("discord.js");
const bot = require("./bot.js");
const prefix = bot.auth.PREFIX
const util = require("util");

let timer = {};

process.on("unhandledRejection", console.log)

bot.on("message", message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    let prev = bot.db.get(message.author.id)
    xp(message);
    levelup(message, prev);

    if (message.content.startsWith(prefix + "rank"))
        rank(message);

    if (message.content.startsWith(prefix + "leaderboard"))
       leaderboard(message);

    else if (message.content.startsWith(prefix + "eval"))
        Eval(message);
})

function xp(message) {
    let date = Date.now();
    let timeout = bot.auth.TIMEOUT;
    let id = message.author.id;
    let user = timer[id];

    if (user) {
        let total = user + timeout;
        if (total <= date) delete timer[id];
        else return;
    }
    if (!user) timer[id] = date;

    const am = Math.round(Math.random()) + 1;
    let b = Math.round(bot.db.get(id) + am);
    return bot.db.set(id, b);
}

function lvlCalc(xp) {
    const y = x => x ? 30 * ((x - 1) ** 2) + 30 : 30;
    const x = y => y > 30 ? (30 + (Math.sqrt(30 * (-30 + y)))) / 30 : 1;

    let lvl = Math.floor(x(xp));
    let base = Math.floor(y(Math.floor(x(xp))));
    let total = Math.floor(y(lvl + 1) - y(lvl));
    let progress =  Math.floor(xp - base);
    return { lvl, total, progress };
}

function levelup(message, prev) {
    let p = lvlCalc(prev);
    let xp = bot.db.get(message.author.id);
    let a = lvlCalc(xp);
    if (p.lvl >= a.lvl) return;
    message.reply("**advanced to level " + a.lvl + "**");
}

async function rank(message) {
    let user = message.mentions.users.first() || message.author
    let xp = bot.db.get(user.id);
    let d = lvlCalc(xp);
    let embed = new RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .addField("› Level", d.lvl)
    .addField("› Progress", `${d.progress}/${d.total} XP`)
    .setColor("#00bfff")

    message.channel.send({embed});
}

function leaderboard(message) {
    let users = bot.db.cache;
    let userKeys = Object.keys(users)
    let txt = [];
    for (let u of userKeys) {
        if (txt.length === 19) break;
        if (!bot.users.has(u)) continue;
        let name = bot.users.get(u).username;
        let d = lvlCalc(users[u]);

        txt.push(`${name} (${d.lvl}) - ${users[u]} XP`);
    }

    let embed = new RichEmbed()
        .setTitle("XP Leaderboard")
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setDescription(txt.join("\n"))
        .setColor("#00bfff")

    message.channel.send({embed})
}

function Eval(message) {
    if (message.author.id !== "163735744995655680") return;
    let suf = message.content.slice(prefix.length)
       .split(" ").slice(1).join(" ");
    let txt;
    try {
        txt = eval(suf)
    } catch(e){
        txt = e
    }
    message.channel.send("Evaled: " + txt)
}
