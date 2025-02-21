const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value < 5) {
                throw new Error('Password must be at least 6 characters')
            }
        }
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'sample');

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        return ({ message: 'Unable to login: User not found' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
        return ({ message: 'Unable to login: Incorrect password' });
    }

    return { message: "Login Success", user };
}


userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next();
})

userSchema.pre('findOneAndDelete', async function (next) {
    const user = this;

    try {
        const deletedUser = await user.model.findOne(user.getQuery());
        if (!deletedUser) {
            throw new Error("User not found");
        }

        await Task.deleteMany({ owner: deletedUser._id });

        next();
    } catch (error) {
        next(error);
    }
});


const User = mongoose.model('User', userSchema)

export default User;
