
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        console.log('Connecting to MongoDB with URI:', MONGO_URI ? 'URI exists' : 'URI is missing');
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MONGODB CONNECTED');
    } catch (err) {
        console.log('❌ MONGODB NOT CONNECTED:', err);
        process.exit(1);
    }
};
