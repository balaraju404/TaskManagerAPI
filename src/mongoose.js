import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using the MONGO_URL environment variable
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/task-manager').then(() => {
    console.log("DB connected")
}).catch((err) => {
    console.error("Error connecting to database:", err.message);
});
