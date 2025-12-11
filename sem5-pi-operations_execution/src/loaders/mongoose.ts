import mongoose from "mongoose";
import config from "../config";

export default async () => {
    const dbUri = config.databaseURL;

    if (!dbUri) {
        throw new Error("❌ MONGODB_URI is missing. Check your .env file.");
    }

    await mongoose.connect(dbUri);

    console.log("✌️ DB loaded and connected!");
};