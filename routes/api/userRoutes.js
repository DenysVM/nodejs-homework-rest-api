const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser, uploadAvatar } = require('../../controllers/userController');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../services/multerConfig');
const avatarMiddleware = require('../../middlewares/avatarMiddleware');


router.post('/register', register);
router.post('/login', login);
router.get('/current', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);
router.patch('/avatars', authMiddleware, upload.single('avatar'), avatarMiddleware, uploadAvatar);

module.exports = router;
