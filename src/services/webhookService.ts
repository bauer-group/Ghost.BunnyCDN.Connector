import AdminAPI from '@tryghost/admin-api';
import crypto from 'crypto';
import Config from '../config/config';
import logger from '../utils/logger';
import Storage from '../utils/storage';
import path from 'path';

class WebhookService {
    private webhooks: Map<string, Function>;
    private ghostAdminAPI: InstanceType<typeof AdminAPI>;
    private ghostWebhookSecret: string;
    private storage: Storage;
    private webhookIds: Record<string, string>;

    constructor() {
        this.webhooks = new Map();
        this.ghostAdminAPI = new AdminAPI({
            url: Config.GHOST_URL,
            key: Config.GHOST_ADMIN_API_SECRET,
            version: "v5.0"
        });
        this.ghostWebhookSecret = Config.GHOST_WEBHOOK_SECRET || crypto.randomUUID();
        this.storage = new Storage('/data/webhookIds.json');
        this.webhookIds = this.storage.load();
    }

    async initializeWebhooks() {
        const requiredWebhooks = [
            "site.changed",

            "post.added",
            "post.deleted",
            "post.edited",
            "post.published",
            "post.published.edited",
            "post.unpublished",
            
            "page.added",
            "page.deleted",
            "page.edited",
            "page.published",
            "page.published.edited",
            "page.unpublished"
        ];

        try {
            let successfulCount = 0;
            for (const event of requiredWebhooks) {
                try {
                    if (!this.webhookIds[event]) {
                        const response = await this.ghostAdminAPI.webhooks.add({
                            event,
                            target_url: `${Config.GHOST_WEBHOOK_TARGET}/webhook`,
                            secret: this.ghostWebhookSecret,
                            name: `Webhook for Event "${event}"`
                        });
                        if (response) {
                            const newWebhookId = response.webhooks?.[0]?.id ?? response.id;
                            this.webhookIds[event] = newWebhookId;
                            successfulCount++;
                            logger.info(`Webhook für Event "${event}" hinzugefügt.`);
                        } else {
                            logger.error(`Fehler beim Hinzufügen des Webhooks für Event "${event}": Ungültige Antwort vom Server.`);
                        }
                    } else {
                        const editResponse = await this.ghostAdminAPI.webhooks.edit({
                            id: this.webhookIds[event],
                            event,
                            target_url: `${Config.GHOST_WEBHOOK_TARGET}/webhook`,
                            secret: this.ghostWebhookSecret,
                            name: `Webhook for Event "${event}"`
                        });
                        if (editResponse) {
                            const newWebhookId = editResponse.webhooks?.[0]?.id ?? editResponse.id;
                            this.webhookIds[event] = newWebhookId;
                            successfulCount++;
                            logger.info(`Webhook für Event "${event}" aktualisiert.`);
                        } else {
                            logger.error(`Fehler beim Aktualisieren des Webhooks für Event "${event}": Ungültige Antwort vom Server.`);
                        }
                    }
                } catch (error: any) {
                    logger.error(`Fehler beim Registrieren des Webhooks für Event "${event}": ${error.message}`);
                }
            }
            this.storage.save(this.webhookIds);

            if (successfulCount === requiredWebhooks.length) {
                logger.info("✅ Webhooks erfolgreich initialisiert!");
            } else {
                logger.error("⚠️ Einige Webhooks konnten nicht erfolgreich angelegt oder aktualisiert werden!");
            }
        } catch (error: any) {
            logger.error(`Fehler beim Initialisieren der Webhooks: ${error.message}`);
        }
    }

    async deleteWebhook(event: string) {
        const webhookId = this.webhookIds[event];
        if (webhookId) {
            await this.ghostAdminAPI.webhooks.delete({ id: webhookId });
            delete this.webhookIds[event];
            this.storage.save(this.webhookIds);
            logger.info(`Webhook für Event "${event}" gelöscht.`);
        } else {
            logger.warn(`Kein Webhook für Event "${event}" gefunden.`);
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