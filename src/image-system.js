const path = require('path');
const Jimp = require('jimp');
const cloneDeep = require('lodash/cloneDeep');
const defaultFontPromise = Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
const defaultAvatarPath = path.resolve(__dirname, '../assets/unknown-avatar.png');
const defaultStyle = {
    bracketBackground: '#FFF',
    bracketColumnGap: 200,
    bracketRowGap: 24,
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

function calcPlayerCardSize(options = {}) {
    const width = options.teamCardWidth || currentStyle.teamCardWidth;
    const height = options.teamCardHeight || currentStyle.teamCardHeight;

    return { width, height };
}

async function createPlayerCard(user, options = {}) {
    const {
        width: cardWidth,
        height: cardHeight
    } = calcPlayerCardSize(options);
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

    if (cardWidth / cardHeight < 1.3) {
        throw new Error('Card dimensions should be greater than 4:1 width:height ratio');
    }

    const font = await fontPromise;
    const avatar = await Jimp.read(user.avatarUrl || defaultAvatarPath);
    const image = await Jimp.read(cardWidth, cardHeight, background);

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

function calcMatchCardSize(options = {}) {
    const playerCardSize = calcPlayerCardSize(options);
    const width = playerCardSize.width;
    const height = playerCardSize.height * 2;

    return { width, height };
}

async function createMatchCard(match, options = {}) {
    const {
        width: matchCardWidth,
        height: matchCardHeight
    } = calcMatchCardSize(options);
    const background = options.matchCardBackground || currentStyle.matchCardBackground;
    const padding = options.matchCardDividerGap || currentStyle.matchCardDividerGap;
    const dividerColor = options.matchCardDividerColor || currentStyle.matchCardDividerColor;

    const player1Card = await createPlayerCard(match.player1, options);
    const player2Card = await createPlayerCard(match.player2, options);
    const divider = await Jimp.read(matchCardWidth - (padding * 2), 2, dividerColor);

    const matchCard = await Jimp.read(matchCardWidth, matchCardHeight, background);
    matchCard.composite(player1Card, 0, 0);
    matchCard.composite(player2Card, 0, player1Card.bitmap.height);
    matchCard.composite(divider, padding, player1Card.bitmap.height - 1);

    return matchCard;
}

async function createRound(round, matches, options = {}) {
    const {
        width: matchCardWidth,
        height: matchCardHeight
    } = calcMatchCardSize(options);
    const bracketRowGap = options.bracketRowGap || currentStyle.bracketRowGap;
    const matchSize = matchCardHeight + bracketRowGap;
    const segmentSize = Math.pow(2, round) * matchSize;

    const roundImage = await Jimp.read(matchCardWidth, segmentSize * matches.length);
    for( let i = 0; i < matches.length; ++i ) {
        const matchImage = await createMatchCard(matches[i]);
        const matchY = (segmentSize * i) + Math.floor(segmentSize / 2) - Math.floor(matchSize / 2) + (bracketRowGap / 2);

        roundImage.composite(matchImage, 0, matchY + bracketRowGap / 2);
    }

    return roundImage;
}

function calcBracketSize(rounds, options = {}) {
    const bracketColumnGap = options.bracketColumnGap || currentStyle.bracketColumnGap;
    const bracketRowGap = options.bracketRowGap || currentStyle.bracketRowGap;
    const {
        width: matchCardWidth,
        height: matchCardHeight
    } = calcMatchCardSize(options);
    const roundColumnWidth = (matchCardWidth + bracketColumnGap);

    const width = rounds * 2 * roundColumnWidth;
    const height = (matchCardHeight + bracketRowGap) * Math.pow(2, Math.max(rounds, 3)) / 4;

    return {
        width,
        height,
        roundColumnWidth,
        bracketColumnGap,
        bracketRowGap
    };
}

async function createBracket(bracket, options = {}) {
    const bracketBackground = options.bracketBackground || currentStyle.bracketBackground;
    const {
        width: bracketWidth,
        height: bracketHeight,
        roundColumnWidth,
        bracketColumnGap,
        bracketRowGap
    } = calcBracketSize(bracket.totalRounds, options);
    const bracketImage = await Jimp.read(bracketWidth, bracketHeight, bracketBackground);

    for( let i = 0; i < bracket.totalRounds - 1; ++i ) {
        const roundMatchesLeft = bracket.rounds[i].left;
        const roundMatchesRight = bracket.rounds[i].right;

        const roundImageLeft = await createRound(i, roundMatchesLeft);
        const roundImageRight = await createRound(i, roundMatchesRight);

        const roundXLeft = i * roundColumnWidth;
        const roundXRight = bracketWidth - roundXLeft - roundImageRight.bitmap.width;

        bracketImage.composite(roundImageLeft, roundXLeft, 0);
        bracketImage.composite(roundImageRight, roundXRight, 0);
    }

    const {
        width: teamCardWidth,
        height: teamCardHeight
    } = calcPlayerCardSize(options);
    const finalMatchImage = await createMatchCard(bracket.rounds[bracket.totalRounds - 1], {
        teamCardWidth: teamCardWidth * 2,
        teamCardHeight: teamCardHeight * 2
    });
    const finalX = (bracket.totalRounds - 1) * roundColumnWidth + bracketColumnGap;
    const finalY = (bracketHeight / 2) - (finalMatchImage.bitmap.height / 2);
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
