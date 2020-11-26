const Discord = require('discord.js');
const pino = require('pino');
const log = pino();

class Bot {
    constructor(token, options) {
        this.prefix = '!';
        this.commands = [];
        this.token = token;
        this.client = new Discord.Client(options);

        this.client.once('ready', (...args) => this.handleReady(...args));
        this.client.on('message', (...args) => this.handleMessage(...args));
    }

    async connect() {
        return this.client.login(this.token);
    }

    handleReady() {
        log.info('Discord client ready');
    }

    handleMessage(message) {
        log.info('Message received: %s', message.id);
        if (message.content.startsWith(this.prefix)) {
            log.info('Command received: %s', message.content);
        }
    }

    async disconnect() {
        return this.client.destroy();
    }
}

module.exports = Bot;
