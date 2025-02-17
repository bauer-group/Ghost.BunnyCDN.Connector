class WebhookController {
    private webhookService: WebhookService;

    constructor(webhookService: WebhookService) {
        this.webhookService = webhookService;
    }

    public handleWebhook = async (req: Request, res: Response): Promise<void> => {
        try {
            const payload: WebhookPayload = req.body;
            const response: WebhookResponse = await this.webhookService.processWebhook(payload);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ message: 'Webhook processing failed', error: error.message });
        }
    };
}

export default WebhookController;