const fs = require('fs/promises');
const path = require('path');
const jimp = require('jimp');

const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');

const avatarMiddleware = async (req, res, next) => {
    if (!req.file) {

        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {

        const imagePath = req.file.path;
        const image = await jimp.read(imagePath);
        await image.cover(250, 250);

        const newFileName = `${req.user._id}-${Date.now()}`;
        const newFilePath = path.join(avatarsDir, newFileName);

        await image.writeAsync(newFilePath);

        req.user.avatarURL = `/avatars/${newFileName}`;
        await req.user.save();
        console.log('User avatar URL updated:', req.user.avatarURL);
        await fs.unlink(imagePath);

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = avatarMiddleware;
