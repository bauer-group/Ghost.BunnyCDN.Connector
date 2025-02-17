import { Request, Response } from 'express';
import WebhookService from '../services/webhookService';
import { WebhookPayload, WebhookResponse } from '../types';
import logger from '../utils/logger';

class WebhookController {
    private webhookService: WebhookService;

    constructor(webhookService: WebhookService) {
        this.webhookService = webhookService;
    }

    public handleWebhook = async (req: Request, res: Response): Promise<void> => {
        try {
            const payload: WebhookPayload = req.body;
            logger.debug(`Empfange Webhook: ${JSON.stringify(payload)}`);
            this.webhookService.processWebhook(payload.event, payload.data);
            res.status(200).json({ status: 'success', message: 'Webhook processed successfully' });
        } catch (error: any) {
            logger.error(`Fehler bei der Verarbeitung des Webhooks: ${error.message}`);
            res.status(500).json({ message: 'Webhook processing failed', error: error.message });
        }
    };
}

export default WebhookController;