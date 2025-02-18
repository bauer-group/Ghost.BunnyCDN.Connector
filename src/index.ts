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
const shutdownHandler = async (signal: string) => {
    logger.info(`🛑 ${signal} signal received: starting graceful shutdown...`);
    
    // Set timeout for graceful shutdown (default Docker timeout is 10s)
    const shutdownTimeout = setTimeout(() => {
        logger.error('💥 Forceful shutdown due to timeout');
        process.exit(1);
    }, 9000); // 9 seconds to allow for Docker's 10s timeout

    try {
        await webhookService.deinitializeWebhooks();        
    } catch (error: any) {
        logger.error('❌ Failed to deinitialize webhooks:', error.message);
    }    

    server.close(() => {
        clearTimeout(shutdownTimeout);
        logger.debug('HTTP server closed');
        logger.info(`⬇ Server Stopped @ ${Config.GHOST_WEBHOOK_TARGET} (http://0.0.0.0:${port})`);
        process.exit(0);
    });

    // Stop accepting new connections
    server.unref();
};

// Handle Docker stop signals
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
process.on('SIGINT', () => shutdownHandler('SIGINT'));
