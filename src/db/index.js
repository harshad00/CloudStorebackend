import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `✅ MongoDB Connected! DB HOST: ${connectionInstance.connection.host}, DB NAME: ${connectionInstance.connection.name}`
        );
    } catch (error) {
        console.error("❌ MONGODB CONNECTION ERROR:", error.message);
        process.exit(1);
    }
};

export default connectDB;

