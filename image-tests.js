const Jimp = require('jimp');
const path = require('path');
const ImageSystem = require('./src/image-system');
const BracketSystem = require('./src/bracket-system');

const spidy = {
    username: 'Spidy88'
};
const genzume = {
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/7a/7a5167a4b45fe0e47f743734ec3de802a9d34a22_full.jpg',
    username: 'Genzume',
    score: 10
};

(async function() {
    // const card1 = await ImageSystem.createPlayerCard({
    //     username: '___________',
    //     avatarUrl: path.resolve(__dirname, 'assets/unknown-avatar.png')
    // }, { width: 400, height: 100 });
    // const card2 = await ImageSystem.createPlayerCard(genzume, { width: 400, height: 100 });
    // const card3 = await ImageSystem.createPlayerCard({ username: 'Spidy88Spidy88Spidy88Spidy88', score: 4, isFinalScore: true, isWinner: false }, { width: 400, height: 100 });
    // const card4 = await ImageSystem.createPlayerCard({ username: 'Genzume', score: 6, isFinalScore: true, isWinner: true }, { width: 400, height: 100 });

    // await card1.writeAsync(path.resolve(__dirname, 'output1.png'));
    // await card2.writeAsync(path.resolve(__dirname, 'output2.png'));
    // await card3.writeAsync(path.resolve(__dirname, 'output3.png'));
    // await card4.writeAsync(path.resolve(__dirname, 'output4.png'));

    // const match1 = await ImageSystem.createMatchCard({ player1: spidy, player2: { username: 'Genzume', avatarUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/7a/7a5167a4b45fe0e47f743734ec3de802a9d34a22_full.jpg' } });
    // await match1.writeAsync(path.resolve(__dirname, 'match1.png'));
    // const match2 = await ImageSystem.createMatchCard({ player1: { username: 'Spidy88Spidy88Spidy88Spidy88Spidy88', score: 5 }, player2: genzume });
    // await match2.writeAsync(path.resolve(__dirname, 'match2.png'));
    // const match3 = await ImageSystem.createMatchCard({ player1: { username: 'Spidy88', score: 5, isFinalScore: true, isWinner: false }, player2: { avatarUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/7a/7a5167a4b45fe0e47f743734ec3de802a9d34a22_full.jpg', username: 'Genzume', score: 8, isFinalScore: true, isWinner: true } });
    // await match3.writeAsync(path.resolve(__dirname, 'match3.png'));

    const playerCount = 31;
    const players = [];
    for( let i = 0; i < playerCount; ++i) {
        players.push({ username: `Player${i+1}` });
    }
    const rounds = Math.ceil(Math.log2(players.length));
    const byes = Math.pow(2, rounds) - players.length;

    let entries = [...players];
    entries = [
        ...entries.slice(0, Math.floor(entries.length/2) + 1),
        ...(new Array(byes).fill({ username: '-Bye-' })),
        ...entries.slice(Math.floor(entries.length/2) + 1)
    ];

    let quadrants = [[], [], [], []];
    for( let i = 0, j = entries.length - 1; i < j; ++i, --j) {
        quadrants[i%4].push({
            player1: entries[i],
            player2: entries[j]
        });
    }

    let leftRound0 = [...quadrants[0], ...quadrants[2]];
    let rightRound0 = [...quadrants[1], ...quadrants[3]];

    // const round0L = await ImageSystem.createRound(0, leftRound);
    // const round0R = await ImageSystem.createRound(0, rightRound);
    // const round1L = await ImageSystem.createRound(1, leftRound1);
    // const round1R = await ImageSystem.createRound(1, rightRound1);
    //const round2 = await ImageSystem.createRound(2, matches2);
    // await round0L.writeAsync(path.resolve(__dirname, 'round0L.png'));
    // await round0R.writeAsync(path.resolve(__dirname, 'round0R.png'));
    // await round1L.writeAsync(path.resolve(__dirname, 'round1L.png'));
    // await round1R.writeAsync(path.resolve(__dirname, 'round1R.png'));
    //await round1.writeAsync(path.resolve(__dirname, 'round1.png'));
    //await round2.writeAsync(path.resolve(__dirname, 'round2.png'));

    const bracket = BracketSystem.generateEmptyBracket(6);
    const bracketImage = await ImageSystem.createBracket(bracket);
    await bracketImage.writeAsync(path.resolve(__dirname, 'output/bracket.png'));
})();
