const path = require('path');

const cardWidth = 200;
const cardHeight = 50;
const padding = 8;
const avatarX = padding;
const avatarY = padding;
const avatarSize = cardHeight - (padding * 2);
const textX = avatarSize + (padding * 2);
const textY = padding;
const textHeight = cardHeight - (padding * 2);
const textWidth = cardWidth - avatarSize - (padding * 3);

const Jimp = require('jimp');
let font;

async function createPlayerCard(user, size) {
    // Lazy load but keep cached
    if (!font) {
        font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    }
    
    // TODO: This comes from the user param, should be url
    let avatar = await Jimp.read(path.resolve(__dirname, 'avatar.jpg'));
    avatar.scaleToFit(avatarSize, avatarSize);

    let image = await Jimp.read(cardWidth, cardHeight, '#DDD');
    image.composite(avatar, avatarX, avatarY);

    const ellipsisWidth = Jimp.measureText(font, '...');
    let username = user.username;
    let currentTextWidth = Jimp.measureText(font, username);
    let fitsHorizontally = currentTextWidth <= textWidth;
    while(!fitsHorizontally) {
        // Calculate the percentage of text reduction needed
        // factoring in the ellipsis size. We might undershoot
        // our desired width given font kerning but if we
        // overshoot, we'll lop it off on the next loop.
        username = username.substring(0, username.length * ((textWidth - ellipsisWidth) / currentTextWidth)) + '...';
        currentTextWidth = Jimp.measureText(font, username);
        fitsHorizontally = currentTextWidth <= textWidth;
    }

    image.print(font, textX, textY, {
        text: username,
        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, Infinity, textHeight);

    const outputPath = path.resolve(__dirname, 'output.png');
    console.log('Writing image to: ', outputPath);
    console.log('Image extension: ', image.getExtension());
    await image.writeAsync(outputPath);
}
