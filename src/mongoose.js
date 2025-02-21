const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using the MONGO_URL environment variable
mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://gandhambalaraju18:Balaraju%4018@cluster0.zresrux.mongodb.net/task-manager')
    .then(() => {
        console.log("DB connected")
    }).catch((err) => {
        console.error("Error connecting to database:", err.message);
    });
