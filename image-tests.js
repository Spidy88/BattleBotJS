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
    console.log('Creating card 1');
    const card1 = await ImageSystem.createPlayerCard(spidy, { width: 400, height: 100 });
    console.log('Creating card 2');
    const card2 = await ImageSystem.createPlayerCard(genzume, { width: 400, height: 100 });
    console.log('Creating card 3');
    const card3 = await ImageSystem.createPlayerCard({ username: 'Spidy88Spidy88Spidy88Spidy88', score: 4, isFinalScore: true, isWinner: false }, { width: 400, height: 100 });
    console.log('Creating card 4');
    const card4 = await ImageSystem.createPlayerCard({ username: 'Genzume', score: 6, isFinalScore: true, isWinner: true }, { width: 400, height: 100 });

    console.log('Writing files');
    await card1.writeAsync(path.resolve(__dirname, 'output1.png'));
    await card2.writeAsync(path.resolve(__dirname, 'output2.png'));
    await card3.writeAsync(path.resolve(__dirname, 'output3.png'));
    await card4.writeAsync(path.resolve(__dirname, 'output4.png'));

    const match1 = await ImageSystem.createMatchCard({ player1: spidy, player2: { username: 'Genzume', avatarUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/7a/7a5167a4b45fe0e47f743734ec3de802a9d34a22_full.jpg' } });
    await match1.writeAsync(path.resolve(__dirname, 'match1.png'));
    const match2 = await ImageSystem.createMatchCard({ player1: { username: 'Spidy88Spidy88Spidy88Spidy88Spidy88', score: 5 }, player2: genzume });
    await match2.writeAsync(path.resolve(__dirname, 'match2.png'));
    const match3 = await ImageSystem.createMatchCard({ player1: { username: 'Spidy88', score: 5, isFinalScore: true, isWinner: false }, player2: { avatarUrl: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/7a/7a5167a4b45fe0e47f743734ec3de802a9d34a22_full.jpg', username: 'Genzume', score: 8, isFinalScore: true, isWinner: true } });
    await match3.writeAsync(path.resolve(__dirname, 'match3.png'));
})();
