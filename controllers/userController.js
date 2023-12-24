const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../services/mailService');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error } = registerSchema.validate({ email, password });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();
        const newUser = await User.create({
            email,
            password: hashedPassword,
            verificationToken,
            verify: false
        });

        const emailContent = `<p>Для завершення реєстрації, будь ласка, перейдіть за цим посиланням для верифікації вашої електронної пошти:</p>
                              <a href="http://localhost:3000/api/user/verify/${verificationToken}">Верифікувати Email</a>`;
        await sendMail(email, 'Верифікація вашої електронної пошти', emailContent);

        res.status(201).json({
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
            },
            message: 'Registration successful! Please check your email to verify your account.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error } = loginSchema.validate({ email, password });
        if (error) {
            console.log('Validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Перевірка, чи електронна пошта користувача верифікована
        if (!user.verify) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        user.token = token;
        await user.save();

        res.status(200).json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription,
            },
        });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const logout = async (req, res) => {
    try {

        const user = req.user;
        console.log('User token before logout:', user ? user.token : 'No user');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        user.token = null;
        await user.save();

        res.status(204).send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getCurrentUser = (req, res) => {
    const currentUser = req.user;

    if (currentUser) {
        res.status(200).json({
            email: currentUser.email,
            subscription: currentUser.subscription,
        });
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        if (!req.user.avatarURL) {
            return res.status(400).json({ message: 'Avatar not uploaded' });
        }

        res.status(200).json({ avatarURL: req.user.avatarURL });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;
    try {
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.verify = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "missing required field email" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verify) {
            return res.status(400).json({ message: "Verification has already been passed" });
        }

        const emailContent = `<h3>Повторне підтвердження електронної пошти</h3>
                              <p>Ми помітили, що ваша електронна пошта ще не була підтверджена. Для завершення реєстрації, будь ласка, перейдіть за цим посиланням:</p>
                              <a href="http://localhost:3000/api/user/verify/${user.verificationToken}">Підтвердити Email</a>
                              <p>Якщо ви не реєструвалися в нашому сервісі, будь ласка, ігноруйте цей лист.</p>`;

        await sendMail(email, 'Повторне підтвердження електронної пошти', emailContent);

        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    uploadAvatar,
    verifyEmail,
    resendVerificationEmail,
};
