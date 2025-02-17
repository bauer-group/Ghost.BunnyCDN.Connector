import express from 'express';
import bodyParser from 'body-parser';
import { WebhookController } from './controllers/webhookController';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const webhookController = new WebhookController();

app.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});