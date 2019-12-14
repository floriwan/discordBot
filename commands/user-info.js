module.exports = {

	name: 'user-info',
	description: 'Return user Info',

	execute(message, args) {
		message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);

	},

};


