const { matches } = require("lodash");

const MODE_SINGLES = '1v1';
const MODE_DOUBLES = '2v2';
const MODE_TRIPLES = '3v3';

const STATUS_DORMANT = 'dormant';
const STATUS_QUEUEING = 'queueing';
const STATUS_RUNNING = 'running';
const STATUS_COMPLETE = 'complete';


const BattleSystem = {
    status: STATUS_DORMANT,
    mode: MODE_TRIPLES,
    players: [],
    isRunning() {
        return BattleSystem.status === STATUS_RUNNING;
    },
    newTournament() {
        if (BattleSystem.isRunning()) {
            return Promise.reject('Tournament already running');
        }
    },
    startTournament() {
        if (BattleSystem.isRunning()) {
            return Promise.reject('Tournament already running');
        }

        BattleSystem.status = STATUS_RUNNING;
        // TODO: Create bracket
    },
    cancelTournament() {
        if (!BattleSystem.isRunning()) {
            return Promise.reject('No tournament in progress');
        }
    },
    get rounds() {
        return Math.ceil(Math.log2(BattleSystem.players.length));
    },
    get bracket() {
        const rounds = BattleSystem.rounds;
        const byes = Math.pow(2, rounds) - BattleSystem.players.length;
        let entries = BattleSystem.players.map((p) => p.id);

        entries = [
            ...entries.slice(0, Math.floor(entries.length/2) + 1),
            ...(new Array(byes).fill({ username: 'Bye' })),
            ...entries.slice(Math.floor(entries.length/2) + 1)
        ];

        let quadrants = [[], [], [], []];
        for( let i = 0, j = entries.length - 1; i < j; ++i, --j) {
            quadrants[i%4].push({
                player1: (i + 1),
                player2: (j + 1)
            });
        }

        console.log('Quadrants: ', quadrants);
    }
};

module.exports = BattleSystem;
