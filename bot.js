const Discord = require('discord.js');
var conf = require('./config.json');
var auth = require('./auth.json')
var mysql = require('mysql');
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
    if (!message.content.startsWith(prefix) ) return;

    // split the command 
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(`-> ${commandName}`);

    // command not found in map
    if (!client.commands.has(commandName)) {
        console.log(`   unkown command ${commandName}`);
        return;
    }
    
    
    const command = client.commands.get(commandName);
    
    // check if we need some arguments
    if (command.args && !args.length) {
        let replyMsg = `${message.author} you didn't provide any arguments!`;

        if (command.usage) {
            replyMsg += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
        }
        
        return message.channel.send(replyMsg);
    }
    
    // call the command
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(`   command error ${error}`);
        message.reply(`there was an error trying to execute ${commandName} command!`);
    }
    
});

client.login(auth.token);
