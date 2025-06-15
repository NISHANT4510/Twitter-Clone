
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        
        console.log('Connecting to MongoDB...');
        
        // Connect with improved options for better stability
        await mongoose.connect(MONGO_URI, {
            // These are default settings in newer Mongoose versions
            // but explicitly setting them for clarity
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ MONGODB CONNECTED');
        return true;
    } catch (err) {
        console.error('❌ MONGODB NOT CONNECTED:', err);
        return false;
    }
};
