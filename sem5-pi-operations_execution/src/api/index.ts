import { Router } from 'express';

export default () => {
    const app = Router();

    app.get('/test', (req, res) => {
        res.json({ result: "O servidor está vivo e a usar a arquitetura nova!" });
    });

    return app;
}