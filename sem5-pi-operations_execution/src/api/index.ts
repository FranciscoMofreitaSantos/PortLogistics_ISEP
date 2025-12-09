import { Router } from 'express';
import userRoute from "./routes/userRoute";

export default () => {
    const app = Router();

    app.get('/test', (req, res) => {
        res.json({ result: "Server is alive and using the new arch!" });
    });

    userRoute(app);
    return app;
}