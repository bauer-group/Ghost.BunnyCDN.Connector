import AdminAPI from '@tryghost/admin-api';
import crypto from 'crypto';
import Config from '../config/config';
import logger from '../utils/logger';

class WebhookService {
    private webhooks: Map<string, Function>;
    private ghostAdminAPI: InstanceType<typeof AdminAPI>;
    private ghostWebhookSecret: string;

    constructor() {
        this.webhooks = new Map();
        this.ghostAdminAPI = new AdminAPI({
            url: Config.GHOST_URL,
            key: Config.GHOST_ADMIN_API_SECRET,
            version: "v5.0"
        });
        this.ghostWebhookSecret = Config.GHOST_WEBHOOK_SECRET || crypto.randomUUID();
    }

    async initializeWebhooks() {
        const requiredWebhooks = [
            "site.changed", "page.published", "page.unpublished", "page.created", 
            "page.updated", "page.deleted", "post.published", "post.unpublished", 
            "post.created", "post.updated", "post.deleted"
        ];

        try {
            const existingWebhooks = await this.ghostAdminAPI.webhooks.browse();
            const existingWebhookEvents = existingWebhooks.map((webhook: any) => webhook.event);

            for (const event of requiredWebhooks) {
                const existingWebhook = existingWebhooks.find((webhook: any) => webhook.event === event);
                if (!existingWebhook) {
                    await this.ghostAdminAPI.webhooks.add({
                        event,
                        target_url: `${Config.GHOST_URL}/webhook`,
                        secret: this.ghostWebhookSecret
                    });
                    logger.info(`Webhook für Event "${event}" hinzugefügt.`);
                } else if (existingWebhook.secret !== this.ghostWebhookSecret || existingWebhook.target_url !== `${Config.GHOST_URL}/webhook`) {
                    await this.ghostAdminAPI.webhooks.edit({
                        id: existingWebhook.id,
                        event,
                        target_url: `${Config.GHOST_URL}/webhook`,
                        secret: this.ghostWebhookSecret
                    });
                    logger.info(`Webhook für Event "${event}" aktualisiert.`);
                } else {
                    logger.info(`Webhook für Event "${event}" bereits vorhanden und aktuell.`);
                }
            }
        } catch (error: any) {
            logger.error(`Fehler beim Initialisieren der Webhooks: ${error.message}`);
        }
    }

    registerWebhook(event: string, callback: Function): void {
        this.webhooks.set(event, callback);
        logger.debug(`Webhook für Event "${event}" registriert.`);
    }

    processWebhook(event: string, payload: any): void {
        const callback = this.webhooks.get(event);
        if (callback) {
            logger.debug(`Verarbeite Webhook für Event "${event}".`);
            callback(payload);
        } else {
            logger.warn(`Kein Webhook für Event "${event}" registriert.`);
        }
    }
}

export default WebhookService;