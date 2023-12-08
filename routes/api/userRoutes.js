const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser } = require('../../controllers/userController');
const authMiddleware = require('../../middlewares/authMiddleware');


router.post('/register', register);
router.post('/login', login);
router.get('/current', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);


module.exports = router;
