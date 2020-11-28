const Jimp = require('jimp');
const path = require('path');
const ImageSystem = require('./src/image-system');

const spidy = {
    username: 'Spidy88'
};
const genzume = {
    avatarUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/7a/7a5167a4b45fe0e47f743734ec3de802a9d34a22_full.jpg',
    username: 'Genzume',
    score: 10
};

(async function() {
    // const card1 = await ImageSystem.createPlayerCard(spidy, { width: 400, height: 100 });
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

    const matches0 = [{
        player1: {username: 'Spidy'},
        player2: {username: 'Genzume'}
    }, {
        player1: {username: 'Tony'},
        player2: {username: 'Martin'}
    }];
    const matches1 = [{
        player1: {username: 'Spidy'},
        player2: {username: 'Tony'}
    }];
    const matches2 = [];
    const round0 = await ImageSystem.createRound(0, matches0);
    const round1 = await ImageSystem.createRound(1, matches1);
    //const round2 = await ImageSystem.createRound(2, matches2);
    await round0.writeAsync(path.resolve(__dirname, 'round0.png'));
    await round1.writeAsync(path.resolve(__dirname, 'round1.png'));
    //await round2.writeAsync(path.resolve(__dirname, 'round2.png'));
})();
