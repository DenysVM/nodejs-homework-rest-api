const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const destPath = path.join(__dirname, '..', 'tmp');
        console.log('Saving file to:', destPath);
        cb(null, destPath);
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


module.exports = upload; 
