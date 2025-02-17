import express from 'express';
import bodyParser from 'body-parser';
import WebhookService from './services/webhookService';
import WebhookController from './controllers/webhookController';
import Config from './config/config';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((err: SyntaxError, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        logger.error('Fehler beim Parsen des JSON-Bodys:', err.message);
        return res.status(400).send({ error: 'Invalid JSON!' });
    }
    next();
});

Config.validate();

const webhookService = new WebhookService();
const webhookController = new WebhookController(webhookService);

app.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

app.listen(port, async () => {
    try {
        await webhookService.initializeWebhooks();
    } catch (error: any) {
        logger.error(`⚠️ Fehler beim Initialisieren der Webhooks: ${error.message}`);
    }

    logger.info(`🚀 Server: ${Config.GHOST_WEBHOOK_TARGET} (http://0.0.0.0:${port})`);
});
