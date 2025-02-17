import { Request, Response } from 'express';
import WebhookService from '../services/webhookService';
import { WebhookPayload, WebhookResponse } from '../interfaces/webhookInterfaces';
import logger from '../utils/logger';

class WebhookController {
    private webhookService: WebhookService;

    constructor(webhookService: WebhookService) {
        this.webhookService = webhookService;
    }

    public handleWebhook = async (req: Request, res: Response): Promise<Response> => {
        try {
            if (!req.body || typeof req.body !== 'object') {
                logger.error("Fehler: Ungültiger oder leerer JSON-Body.");
                return res.status(400).json({ Status: 'Error', Message: "Bad Request: Invalid JSON body" });
            }

            const event = req.path.split('/').filter(Boolean).pop()?.replace(/-/g, '.');
            if (!event) {
                return res.status(400).json({ Status: 'Error', Message: 'Invalid Webhook Endpoint' });                
            }
            const payload: WebhookPayload = req.body;
            logger.debug(`Empfange Webhook: ${JSON.stringify(payload)}`);
            const response: WebhookResponse = this.webhookService.processWebhook(event, payload);
            return res.status(response.Status.toLowerCase() === 'success' ? 200 : 400).json(response);
        } catch (error: any) {
            logger.error(`Fehler im WebhookController: ${error.message}`);
            return res.status(400).json({ Status: 'Error', Message: "Errors during processing" });
        }
    };
}

export default WebhookController;