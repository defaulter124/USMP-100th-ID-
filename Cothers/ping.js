module.exports = {
	name : 'ping',
	description : 'the basic ping command. Mainly used to test if the bot was on or not',
	usage:'!ping',
	execute(message, args) {
		message.channel.send('pong!');
	},

};
