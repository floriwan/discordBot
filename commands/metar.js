module.exports = {

	name: 'metar',
	description: 'MetarInformation',
	execute(message, args) {
if (!args.length) {
            return message.channel.send(`${message.author} you didn't provide any ICAO airport code!`);
        }
        const icaoCode = args[0].toLowerCase();
        var regex = RegExp('[a-z]{4}');
        if (!regex.test(icaoCode)) {
            return message.channel.send(`${message.author} you didn't provide a valid ICAO airport code!`);
        } else {
        }

	},

};


