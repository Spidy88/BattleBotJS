const path = require('path');
const Jimp = require('jimp');
const cloneDeep = require('lodash/cloneDeep');
const defaultFontPromise = Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
const defaultAvatarPath = path.resolve(__dirname, '../assets/unknown-avatar.png');
const defaultStyle = {
    bracketBackground: '#FFF',
    bracketColumnGap: 100,
    bracketRowGap: 12,
    matchCardBackground: '#DDD',
    matchCardDividerColor: '#CCC',
    matchCardDividerGap: 12,
    teamCardBackground: '#DDD',
    teamCardWidth: 400,
    teamCardHeight: 100,
    teamCardPadding: 12,
    teamCardElementSpacing: 12,
    scoreWinColor: '#329127',
    scoreLoseColor: '#611d10'
};

const currentStyle = cloneDeep(defaultStyle);

async function createPlayerCard(user, options = {}) {
    const cardWidth = options.teamCardWidth || currentStyle.teamCardWidth;
    const cardHeight = options.teamCardHeight || currentStyle.teamCardHeight;
    const background = options.teamCardBackground || currentStyle.teamCardBackground;
    const padding = options.teamCardPadding || currentStyle.teamCardPadding;
    
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
        const winColor = options.winColor || currentStyle.scoreWinColor;
        const loseColor = options.loseColor || currentStyle.scoreLoseColor;

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
    const background = options.matchCardBackground || currentStyle.matchCardBackground;
    const padding = options.matchCardDividerGap || currentStyle.matchCardDividerGap;
    const dividerColor = options.matchCardDividerColor || currentStyle.matchCardDividerColor;
    const player1 = match.player1;
    const player2 = match.player2;

    const player1Card = await createPlayerCard(player1, options);
    const player2Card = await createPlayerCard(player2, options);
    const divider = await Jimp.read(player1Card.bitmap.width - (padding * 2), 2, dividerColor);

    const matchCard = await Jimp.read(player1Card.bitmap.width, player1Card.bitmap.height * 2, background);
    matchCard.composite(player1Card, 0, 0);
    matchCard.composite(player2Card, 0, player1Card.bitmap.height);
    matchCard.composite(divider, padding, player1Card.bitmap.height - 1);

    return matchCard;
}

async function createRound(round, matches, options = {}) {
    const teamCardHeight = options.teamCardHeight || currentStyle.teamCardHeight;
    const matchCardDividerGap = options.matchCardDividerGap || currentStyle.matchCardDividerGap;
    const matchSize = teamCardHeight * 2 + matchCardDividerGap;
    const totalSize = Math.pow(2, round) * matchSize;

    const roundImage = await Jimp.read(400, totalSize * matches.length);
    for( let i = 0; i < matches.length; ++i ) {
        const matchImage = await createMatchCard(matches[i]);
        const matchY = (totalSize * i) + Math.floor(totalSize / 2) - Math.floor(matchSize / 2);

        roundImage.composite(matchImage, 0, matchY + 8);
    }

    return roundImage;
}

async function createBracket(bracket, options = {}) {
    const bracketBackground = options.bracketBackground || currentStyle.bracketBackground;
    const bracketColumnGap = options.bracketColumnGap || currentStyle.bracketColumnGap;
    const bracketRowGap = options.bracketRowGap || currentStyle.bracketRowGap;
    const teamCardWidth = options.teamCardWidth || currentStyle.teamCardWidth;
    const teamCardHeight = options.teamCardHeight || currentStyle.teamCardHeight;
    const matchCardDividerGap = options.matchCardDividerGap || currentStyle.matchCardDividerGap;
    const roundColumnWidth = (teamCardWidth + bracketColumnGap);
    const matchCardHeight = teamCardHeight * 2 + matchCardDividerGap;
    const rounds = bracket.totalRounds;
    const totalWidth = rounds * 2 * roundColumnWidth;
    const totalHeight = (matchCardHeight + bracketRowGap) * Math.pow(2, Math.max(rounds, 3)) / 4;
    const bracketImage = await Jimp.read(totalWidth, totalHeight, bracketBackground);

    for( let i = 0; i < rounds - 1; ++i ) {
        const roundMatchesLeft = bracket.rounds[i].left;
        const roundMatchesRight = bracket.rounds[i].right;

        const roundImageLeft = await createRound(i, roundMatchesLeft);
        const roundImageRight = await createRound(i, roundMatchesRight);

        const roundXLeft = i * roundColumnWidth;
        const roundXRight = totalWidth - roundXLeft - roundImageRight.bitmap.width;

        bracketImage.composite(roundImageLeft, roundXLeft, 0);
        bracketImage.composite(roundImageRight, roundXRight, 0);
    }

    const finalMatchImage = await createMatchCard(bracket.rounds[rounds - 1], {
        teamCardWidth: teamCardWidth * 2,
        teamCardHeight: teamCardHeight * 2
    });
    const finalX = (rounds - 1) * roundColumnWidth + bracketColumnGap;
    const finalY = (totalHeight / 2) - (finalMatchImage.bitmap.height / 2);
    bracketImage.composite(finalMatchImage, finalX, finalY);

    return bracketImage;
}

const ImageSystem = {
    createPlayerCard,
    createMatchCard,
    createRound,
    createBracket
};

module.exports = ImageSystem;
