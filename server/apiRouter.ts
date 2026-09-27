import { Router, Request, Response } from 'express';

export const apiRouter = Router();

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Anime Card Clash 2P Game Service',
    timestamp: new Date().toISOString(),
  });
});
