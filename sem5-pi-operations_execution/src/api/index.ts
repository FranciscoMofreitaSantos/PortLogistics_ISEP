import { Router } from 'express';

export default () => {
    const app = Router();

    app.get('/test', (req, res) => {
        res.json({ result: "Server is alive and using the new arch!" });
    });

    return app;
}