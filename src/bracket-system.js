const cloneDeep = require('lodash/cloneDeep');
const TBD = { username: 'TBD' };
const EMPTY_MATCH = { player1: TBD, player2: TBD };

const BracketSystem = {
    generateEmptyBracket(totalRounds) {
        const rounds = {};

        for( let i = 0; i < totalRounds - 1; ++i ) {
            const size = Math.pow(2, totalRounds - i) / 4;
            const ray = new Array(size).fill(0);
            const left = ray.map(() => cloneDeep(EMPTY_MATCH));
            const right = ray.map(() => cloneDeep(EMPTY_MATCH));
            rounds[i] = { left, right };
        }

        rounds[totalRounds - 1] = cloneDeep(EMPTY_MATCH);

        const bracket = {
            rounds,
            totalRounds
        };

        return bracket;
    }
};

module.exports = BracketSystem;
