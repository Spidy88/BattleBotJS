const path = require('path');
const Jimp = require('jimp');
const defaultFontPromise = Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
const defaultAvatarPath = path.resolve(__dirname, '../avatar.jpg');
const defaultWinColor = '#329127';
const defaultLoseColor = '#611d10';

async function createPlayerCard(user, size, options = {}) {
    const cardWidth = size.width;
    const cardHeight = size.height;
    const background = options.background || '#DDD';
    const padding = options.padding || 8;
    
    const avatarX = padding;
    const avatarY = padding;
    const avatarSize = cardHeight - (padding * 2);

    const textX = avatarSize + (padding * 2);
    const textY = padding;
    const textHeight = cardHeight - (padding * 2);
    let textWidth = cardWidth - avatarSize - (padding * 3);

    const fontPromise = options.font ? Jimp.loadFont(options.font) : defaultFontPromise;

    if (cardWidth/cardHeight < 1.3) {
        throw new Error('Card dimensions should be greater than 4:1 width:height ratio');
    }

    let font = await fontPromise;
    let avatar = await Jimp.read(user.avatarUrl || defaultAvatarPath);
    let image = await Jimp.read(cardWidth, cardHeight, background);

    let scoreWidth = 0
    
    if (user.score) {
        const winColor = options.winColor || defaultWinColor;
        const loseColor = options.loseColor || defaultLoseColor;

        scoreWidth = Jimp.measureText(font, String(user.score));

        const scoreImage = await Jimp.read(scoreWidth, cardHeight);
        scoreImage.print(font, 0, 0, {
            text: String(user.score),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        }, scoreWidth, cardHeight);

        if (user.isFinalScore) {
            const scoreColor = user.isWinner ? winColor : loseColor;
            scoreImage.color([{ apply: 'xor', params: [scoreColor] }]);
        }

        const scoreX = cardWidth - (padding + scoreWidth);
        const scoreY = 0;

        image.composite(scoreImage, scoreX, scoreY);
        textWidth -= (scoreWidth + padding);
    }

    // Scale the avatar down and composite it on top of our image
    avatar.scaleToFit(avatarSize, avatarSize);
    image.composite(avatar, avatarX, avatarY);

    const ellipsisWidth = Jimp.measureText(font, '...');

    let username = user.username;
    let currentTextWidth = Jimp.measureText(font, username);
    let fitsHorizontally = currentTextWidth <= textWidth;

    // Calculate the percentage of text reduction needed
    // factoring in the ellipsis size. We might undershoot
    // our desired width given font kerning but if we
    // overshoot, we'll lop it off on the next loop.
    while(!fitsHorizontally) {
        const adjustedUsernameLength = username.length * ((textWidth - ellipsisWidth) / currentTextWidth);
        username = username.substring(0, adjustedUsernameLength) + '...';
        currentTextWidth = Jimp.measureText(font, username);
        fitsHorizontally = currentTextWidth <= textWidth;
    }

    image.print(font, textX, textY, {
        text: username,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, Infinity, textHeight);

    if (user.isFinalScore && !user.isWinner) {
        image.fade(0.5);
    }

    return image;
}

async function createMatchCard(match, options = {}) {
    const background = options.background || '#DDD';
    const padding = options.padding || 8;
    const size = { width: 400, height: 100 };
    const player1 = match.player1;
    const player2 = match.player2;

    const player1Card = await createPlayerCard(player1, size);
    const player2Card = await createPlayerCard(player2, size);
    const divider = await Jimp.read(size.width - (padding * 2), 2, '#CCC');

    const matchCard = await Jimp.read(size.width, size.height * 2, background);
    matchCard.composite(player1Card, 0, 0);
    matchCard.composite(player2Card, 0, size.height);
    matchCard.composite(divider, padding, size.height - 1);

    return matchCard;
}

async function createRound(round, matches) {
    // matchSize = playerCard*2 + padding*2
    const matchSize = 216;
    const totalSize = Math.pow(2, round) * matchSize;

    const roundImage = await Jimp.read(400, totalSize * matches.length);
    for( let i = 0; i < matches.length; ++i ) {
        const matchImage = await createMatchCard(matches[i]);
        const matchY = (totalSize * i) + Math.floor(totalSize / 2) - Math.floor(matchSize / 2);

        roundImage.composite(matchImage, 0, matchY + 8);
    }

    return roundImage;
}

async function createBracket(players) {
    const rounds = Math.ceil(Math.log2(players.length));
    const totalWidth = rounds * 2 * 500;
    const totalHeight = 216 * Math.pow(2, rounds);
    const bracketImage = await Jimp.read(totalWidth, totalHeight, '#fff');

    for( let i = 0; i < rounds; ++i ) {
        const roundMatchesLeft = [];
        const roundMatchesRight = [];

        const roundImageLeft = await createRound(i, roundMatchesLeft);
        const roundImageRight = await createRound(i, roundMatchesRight);

        const roundXLeft = i * 500;
        const roundXRight = totalWidth - roundXLeft - roundImageRight.width;

        bracketImage.composite(roundImageLeft, roundXLeft, 0);
        bracketImage.composite(roundImageRight, roundXRight, 0);
    }

    return bracketImage;
}

const ImageSystem = {
    createPlayerCard,
    createMatchCard,
    createRound,
    createBracket
};

module.exports = ImageSystem;
