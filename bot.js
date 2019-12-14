const Discord = require('discord.js');
var conf = require('./config.json');
var auth = require('./auth.json')
const fs = require('fs');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// import command files and build command map
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`add command ${command.name}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log('running ...');
});

client.on('message', message => {
    
    var prefix = conf.prefix;
    
    // return for commands not starting with prefix
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // split the command 
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(`-> ${command}`);

    // command not found in map
    if (!client.commands.has(command)) {
        console.log(`   unkown command ${command}`);
        return;
    }
    
    // call the command
    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(`   command error ${error}`);
        message.reply(`there was an error trying to execute ${command} command!`);
    }
    
});

client.login(auth.token);
