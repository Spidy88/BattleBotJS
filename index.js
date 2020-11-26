require('dotenv').config();

const pino = require('pino');
const Bot = require('./src/bot');
const token = process.env.DISCORD_TOKEN;
const log = pino();

let isShuttingDown = false;
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const bot = new Bot(token);

startup()
    .catch((e) => {
        log.error('Catastrophic failure: ', e);
        process.exit(1);
    });

async function startup() {
    log.info('Starting up');
    await bot.connect();
}

async function shutdown() {
    if (isShuttingDown) return;

    log.info('Shutting down connections');
    isShuttingDown = true;

    await bot.disconnect();
    process.exit(0);
}
