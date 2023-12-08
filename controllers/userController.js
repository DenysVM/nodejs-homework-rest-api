const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/userModel');

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
        const newUser = await User.create({ email, password: hashedPassword });

        res.status(201).json({
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
            },
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

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
};
