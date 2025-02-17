class WebhookService {
    private webhooks: Map<string, Function>;

    constructor() {
        this.webhooks = new Map();
    }

    registerWebhook(event: string, callback: Function): void {
        this.webhooks.set(event, callback);
    }

    processWebhook(event: string, payload: any): void {
        const callback = this.webhooks.get(event);
        if (callback) {
            callback(payload);
        } else {
            console.warn(`No webhook registered for event: ${event}`);
        }
    }
}

export default WebhookService;