import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Register event listeners BEFORE connecting
        mongoose.connection.on('connected', () =>
            console.log("✅ MongoDB Connected Successfully")
        );

        mongoose.connection.on('error', (err) =>
            console.error("❌ MongoDB Connection Error:", err.message)
        );

        mongoose.connection.on('disconnected', () =>
            console.warn("⚠️  MongoDB Disconnected")
        );

        await mongoose.connect(`${process.env.MONGODB_URI}/quickblog`, {
            serverSelectionTimeoutMS: 10000, // fail fast with a clear error
        });

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);
        console.error(
            "\n👉 Most likely causes:\n" +
            "  1. Your current IP is NOT whitelisted in MongoDB Atlas.\n" +
            "     Go to: Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) for dev.\n" +
            "  2. Wrong MONGODB_URI or credentials in .env\n" +
            "  3. No internet connection\n"
        );
        throw error; // Let the caller handle it instead of killing the process
    }
};

export default connectDB;