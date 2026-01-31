const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URL, {   
            // useNewUrlParser: true,
            // useUnifiedTopology: true 
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

module.exports = connectDatabase;