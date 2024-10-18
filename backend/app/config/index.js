const mongoose = require('mongoose');
const config = {
    app: {
        port: process.env.PORT || 3000,
    },
    db: {
        uri: process.env.MONGODB_URI || "mongodb+srv://tdat:123@cluster0.ghnnihw.mongodb.net/test_eranin?retryWrites=true&w=majority&appName=Cluster0"
        // uri: 'mongodb+srv://test_01:123@cluster0.ghnnihw.mongodb.net/restaurant'
    }
};

const connectDB = async () => {
  try {
    await mongoose.connect(config.db.uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = {config, connectDB};