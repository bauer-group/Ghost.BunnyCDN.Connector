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

app.listen(port, async () => {
    logger.info(`🔧 Server läuft auf http://0.0.0.0:${port}`);    

    try {
        await webhookService.initializeWebhooks();
        logger.info("✅ Webhooks erfolgreich initialisiert!");
    } catch (error: any) {
        logger.error(`⚠️ Fehler beim Initialisieren der Webhooks: ${error.message}`);
    }
});
