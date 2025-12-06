import mongoose from "mongoose";

export async function connectToDatabase(): Promise<void> {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("MONGO_URI not defined in environment variables");
        }

        await mongoose.connect(mongoUri);

        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}