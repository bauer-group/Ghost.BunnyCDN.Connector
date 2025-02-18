import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import WebhookService from './services/webhookService';
import WebhookController from './controllers/webhookController';
import Config from './config/config';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);

    if (err instanceof SyntaxError && 'body' in err) {
        logger.error('Error parsing JSON body:', err.message);
        return res.status(400).send({ Status: 'Error', Message: 'Invalid JSON!' });
    }

    // Generic error response
    res.status(500).send({ Status: 'Error', Message: 'Internal Server Error' });
});

// Configuration validation
try {
    Config.Validate();
} catch (error: any) {
    logger.error('Configuration error:', error.message);
    process.exit(1); // Exit if configuration is invalid
}

// Initialize services and controllers
const webhookService = new WebhookService();
const webhookController = new WebhookController(webhookService);

const requiredWebhooks = Config.RequiredWebhooks;

requiredWebhooks.forEach(event => {
    const eventRoute = event.replace(/\./g, '-');
    app.post(`/webhook/${eventRoute}`, (req, res) => webhookController.handleWebhook(req, res));
});

// Start the server
const server = app.listen(port, async () => {
    try {
        await webhookService.initializeWebhooks();
    } catch (error: any) {
        logger.error(`⚠️ Fehler beim Initialisieren der Webhooks: ${error.message}`);
    }

    logger.info(`🚀 Server Running @ ${Config.GHOST_WEBHOOK_TARGET} (http://0.0.0.0:${port})`);
});

// Handle shutdown
const shutdownHandler = (signal: string) => {
    logger.info(`🛑 ${signal} signal received: closing HTTP server`);
    server.close(() => {
        logger.debug('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
process.on('SIGINT', () => shutdownHandler('SIGINT'));
