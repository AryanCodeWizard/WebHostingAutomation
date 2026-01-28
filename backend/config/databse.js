import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {   
            // useNewUrlParser: true,
            // useUnifiedTopology: true 
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

export default connectDatabase;