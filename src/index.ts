import express from 'express';
import bodyParser from 'body-parser';
import WebhookService from './services/webhookService';
import WebhookController from './controllers/webhookController';
import Config from './config/config';
import logger from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

Config.validate();

const webhookService = new WebhookService();
const webhookController = new WebhookController(webhookService);

app.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

app.delete('/webhook/:event', async (req, res) => {
    const event = req.params.event;
    try {
        await webhookService.deleteWebhook(event);
        res.status(204).send();
    } catch (error: any) {
        logger.error(`⚠️ Fehler beim Löschen des Webhooks: ${error.message}`);
        res.status(500).send({ error: error.message });
    }
});

app.listen(port, async () => {
    try {
        await webhookService.initializeWebhooks();
    } catch (error: any) {
        logger.error(`⚠️ Fehler beim Initialisieren der Webhooks: ${error.message}`);
    }

    logger.info(`🚀 Server: ${Config.GHOST_WEBHOOK_TARGET} (http://0.0.0.0:${port})`);
});
