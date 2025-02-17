import { Request, Response } from 'express';
import WebhookService from '../services/webhookService';
import { WebhookPayload, WebhookResponse } from '../types';
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
                return res.status(400).json({ Error: "Bad Request: Invalid JSON body" });
            }

            if (!req.body.event) {
                logger.error("Fehler: 'event' im JSON-Body fehlt.");
                return res.status(400).json({ Error: "Bad Request: 'event' missing" });
            }

            const payload: WebhookPayload = req.body;
            logger.debug(`Empfange Webhook: ${JSON.stringify(payload)}`);
            this.webhookService.processWebhook(payload.event, payload.data);
            return res.status(200).json({ Status: "OK" });
        } catch (error: any) {
            logger.error(`Fehler im WebhookController: ${error.message}`);
            return res.status(400).json({ Error: "Errors during processing" });
        }
    };
}

export default WebhookController;