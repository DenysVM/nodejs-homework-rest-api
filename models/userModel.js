const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');

const userSchema = new mongoose.Schema({
    password: {
        type: String,
        required: [true, 'Set password for user'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
        type: String,
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
    }],
    avatarURL: {
        type: String,
    },
});

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
    this.token = token;
    await this.save();
    return token;
};

userSchema.methods.removeToken = async function () {
    this.token = null;
    await this.save();
};

userSchema.pre('save', function (next) {
    if (!this.avatarURL) {
        const avatar = gravatar.url(this.email, { s: '200', r: 'pg', d: 'mm' });
        this.avatarURL = avatar;
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
