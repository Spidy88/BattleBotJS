const Discord = require('discord.js');
const pino = require('pino');
const noop = require('lodash/noop');
const isArrayLike = require('lodash/isArrayLike');
const log = pino();

class Bot {
    constructor(token, options) {
        this.prefix = '!';
        this.commands = new Map();
        this.token = token;
        this.client = new Discord.Client(options);

        this.client.once('ready', (...args) => this.handleReady(...args));
        this.client.on('message', (...args) => this.handleMessage(...args));

        this.commands.set('!register', registerUser);
        this.commands.set('!rules', displayRules);
        this.commands.set('!signup', signUp);
        this.commands.set('!withdraw', withdraw);
        this.commands.set('!bracket', printBracket);
        this.commands.set('!newTournament', createTournament);
        this.commands.set('!startTournament', startTournament);
        this.commands.set('!cancelTournament', cancelTournament);
        this.commands.set('!matchResult', matchResult);
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
            let [command] = message.content.split(/\s+/);
            let commandHandler = this.commands.get(command) || noop;

            commandHandler(message);
        }
    }

    async disconnect() {
        return this.client.destroy();
    }
}

module.exports = Bot;

// TODO: THIS IS HOW WE 1800 line python files!
async function isTournamentMod(user) {
    return true;
}

async function isOwner(user) {
    return true;
}

const players = new Map();
async function registerUser(message) {
    const users = message.mentions.users.array();
    const members = message.mentions.members;
    const mentionedSelf = users.length === 1 && users[0].id === message.author.id;
    const isRegisteringSelf = !users.length || mentionedSelf;
    const canRegisterOthers = (await Promise.allSettled([
        isTournamentMod(message.author),
        isOwner(message.author)
    ])).some(Boolean);

    log.info('is array: %s', isArrayLike(users));
    log.info('mentions: %s', message.mentions);
    log.info('Users length: %s', users.length);
    log.info('Users id: %s', users.length && users[0].id);
    log.info('members length: %s', members.length);
    log.info('members id: %s', members.length && members[0].id);
    log.info('Authors id: %s', message.author.id);
    log.info('Is registering self: %s', isRegisteringSelf);

    if (!isRegisteringSelf && !canRegisterOthers) {
        await message.reply('You do not have permission to register other users');
        return;
    }
    log.info('Mentions: %s', JSON.stringify(users));
    let newUsers = isRegisteringSelf
        ? [message.author]
        : [...users];

    // Register newUsers
    for (let user of newUsers) {
        if (!players.has(user.id)) {
            players.set(user.id, user);

            try {
                let dmChannel = await user.createDM();
                await dmChannel.send('You have been registered for Rocket League Sub Battles\n\nYou can request to be notified of future tournaments with !notifyMe');
            }
            catch(e) {
                log.error('Failed to DM player: %s', user.id);
            }
        }
    }

    // TODO: Save data back up
}

function displayRules(message) {}
function signUp(message) {}
function withdraw(message) {}
function printBracket(message) {}
function createTournament(message) {}
function startTournament(message) {}
function cancelTournament(message) {}
function matchResult(message) {}