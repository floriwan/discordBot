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

var db_config = {
    host: "localhost",
    user: conf.dbuser,
    password: conf.dbpass
}

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if(err) {
            console.log("error when connection to database: ", err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    
    connection.on('error', function(err) {
        console.log("database error", err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

// create database connection hand handle disconnect issues
handleDisconnect();

client.once('ready', () => {
	console.log('running ...');
});

client.on('message', message => {
    
    var prefix = conf.prefix;
    
    // return for commands not starting with prefix
    if (!message.content.startsWith(prefix) || message.connectionauthor.bot) return;

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
        command.execute(message, args, connection);
    } catch (error) {
        console.error(`   command error ${error}`);
        message.reply(`there was an error trying to execute ${commandName} command!`);
    }
    
});

client.login(auth.token);
