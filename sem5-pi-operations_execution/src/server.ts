import app from "./app";
import { connectToDatabase } from "./config/database";

const PORT = process.env.PORT || 3000;

async function start() {
    await connectToDatabase();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

start();