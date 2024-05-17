import express from "express";
import User from "../model/user.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import sharp from 'sharp';
import { sendOTPtoMail, sendWelcomeMail, sendCancelationMail } from '../emails/account.js'
import validator from "validator";

const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    console.log(user);
    try {
        const exstingUser = await User.findOne({ email: user.email })
        if (exstingUser) {
            return res.status(400).send('User already exists');
        }
        await user.save();
        sendWelcomeMail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/users/otp', async (req, res) => {
    try {
        const otp = req.body.otp;
        const email = req.body.email;

        if (!validator.isEmail(email)) {
            return res.status(400).send('Invalid Email')
        }

        const exstingUser = await User.findOne({ email: email });
        if (exstingUser) {
            return res.status(400).send('User already exist');
        }

        sendOTPtoMail(email, otp);

        res.status(200).json({ message: 'OTP sent successfully', otp: otp });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, message } = await User.findByCredentials(email, password);

        if (message !== "Login Success") {
            return res.status(401).send(message);
        }

        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})

router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'isAdmin'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: "Invalid updates" });
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();
        res.status(202).json({ message: "User updated!" });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).send(error);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await User.findOneAndDelete({ _id: req.user._id });
        sendCancelationMail(req.user.email, req.user.name)
        res.status(202).json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/gm)) {
            return cb(new Error("Please upload an image"))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ message: "Avatar uploaded" })
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send({ error: "User not found" });
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({ message: "Profile deleted" })
})

export default router;