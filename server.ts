import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer } from 'http';

// Prevent process crashes on external hosts from unhandled background library promises
process.on('unhandledRejection', (reason: any) => {
  console.warn('⚠️ Handled unhandledRejection:', reason?.message || reason);
});

process.on('uncaughtException', (err: any) => {
  console.warn('⚠️ Handled uncaughtException:', err?.message || err);
});

import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { initSocket } from './src/services/socketService';
import { startMarketEngine } from './src/services/marketEngine';
import { startMasterSimulation, seedMasterTraders } from './src/services/copyTradingService';
import { backupDatabase } from './src/db/backup';
import authRouter from './src/api/auth';
import apiRouter from './src/api/routes';
import logger from './src/lib/logger';

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = 3000;
  const httpServer = createServer(app);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());
  
  // Logging
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000, // Increased for dev/heavy use
    message: { error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased for dev
    message: { error: 'Too many login/register attempts. Please try again after 15 minutes.' }
  });
  app.use('/api/auth/', authLimiter);

  // Initialize Socket.IO
  initSocket(httpServer);

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api', apiRouter);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Catch-all for missing API endpoints to prevent returning HTML for API calls
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found', path: req.path });
  });

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://market.bivaax.trade/sitemap.xml`);
  });

  // SEO: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://market.bivaax.trade/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://market.bivaax.trade/trade</loc>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://market.bivaax.trade/affiliate</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://market.bivaax.trade/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://market.bivaax.trade/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://market.bivaax.trade/docs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://market.bivaax.trade/about-us</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
  });

  // Centralized Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    const status = err.status || 500;
    res.status(status).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
  });

  // Schedule Daily Backup (Every 24 hours)
  setInterval(backupDatabase, 24 * 60 * 60 * 1000);
  // backupDatabase(); // Disabled for faster startup

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Seed master traders
    await seedMasterTraders();
    // Start Market Engine after listening
    startMarketEngine();
    // Start Copy Trading Simulation
    startMasterSimulation();
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
