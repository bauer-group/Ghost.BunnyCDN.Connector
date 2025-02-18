import { Request, Response } from 'express';
import WebhookService from '../services/webhookService';
import logger from '../utils/logger';
import { WebhookPayload, WebhookResponse } from '../interfaces/webhookInterfaces';
import { WebhookValidator } from '../utils/webhookValidator';
import Config from '../config/config';

/**
 * WebhookController class to handle incoming webhook requests.
 */
class WebhookController {
    private webhookService: WebhookService;

    /**
     * Constructor for WebhookController.
     * @param webhookService The WebhookService instance to use.
     */
    constructor(webhookService: WebhookService) {
        this.webhookService = webhookService;
    }

    /**
     * Handles incoming webhook requests.
     * @param req The Express Request object.
     * @param res The Express Response object.
     * @returns A Promise that resolves to an Express Response.
     */
    public handleWebhook = async (req: Request, res: Response): Promise<Response> => {
        
        const signature = req.headers['x-ghost-signature'] as string;
        const secret = Config.GHOST_WEBHOOK_SECRET;
        const webhookValidator = new WebhookValidator(secret);

        //Webhook validation
        /*
        try {        
            webhookValidator.verify(req.body, signature);
        } catch (error: any) {
            logger.error(`Error verifying webhook: ${error.message}`);
            return res.status(401).json({ Status: 'Error', Message: error.message });
        }
        */

        //Webhook processing with exception handling
        try {
            //body validation
            if (!req.body || typeof req.body !== 'object') {
                logger.error("Invalid or empty JSON body.");
                return res.status(400).json({ Status: 'Error', Message: "Bad Request: Invalid JSON body" });
            }

            //event validation
            const event = req.path.split('/').filter(Boolean).pop()?.replace(/-/g, '.');
            if (!event) {
                logger.error("Invalid Webhook Endpoint");
                return res.status(400).json({ Status: 'Error', Message: 'Invalid Webhook Endpoint' });
            }

            const payload: WebhookPayload = req.body;
            logger.debug(`Received Webhook: ${JSON.stringify(payload)}`);

            //processing payload
            let response: WebhookResponse;
            try {
                response = this.webhookService.processWebhook(event, payload);
            } catch (serviceError: any) {
                logger.error(`Error processing webhook in WebhookService: ${serviceError.message}`);
                return res.status(500).json({ Status: 'Error', Message: 'Error processing webhook' });
            }

            const statusCode = response.Status.toLowerCase() === 'success' ? 200 : 400;
            return res.status(statusCode).json(response);

        } catch (error: any) {
            logger.error(`Error in WebhookController: ${error.message}`);
            return res.status(500).json({ Status: 'Error', Message: "Internal Server Error" });
        }
    };
}

export default WebhookController;