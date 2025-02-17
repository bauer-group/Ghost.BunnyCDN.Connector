import AdminAPI from '@tryghost/admin-api';
import crypto from 'crypto';
import Config from '../config/config';
import logger from '../utils/logger';
import Storage from '../utils/storage';
import path from 'path';
import { WebhookPayload, WebhookResponse } from '../interfaces/webhookInterfaces';

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

    registerWebhook(event: string, callback: Function): void {
        this.webhooks.set(event, callback);
        logger.debug(`Callback für Event "${event}" registriert.`);
    }

    private handleEventCallback(event: string, payload: WebhookPayload): WebhookResponse {
        logger.debug(`Callback für Event "${event}" ausgeführt mit Payload: ${JSON.stringify(payload)}`);
        // Hier kannst du die Payload weiterverarbeiten
        return {
            Status: 'Success',
            Message: `Event "${event}" erfolgreich verarbeitet.`
        };
    }

    async initializeWebhooks() {
        const requiredWebhooks = Config.RequiredWebhooks;

        try {
            let successfulCount = 0;
            for (const event of requiredWebhooks) {
                try {
                    const targetUrl = `${Config.GHOST_WEBHOOK_TARGET}/webhook/${event.replace(/\./g, '-')}`;
                    if (!this.webhookIds[event]) {
                        const response = await this.ghostAdminAPI.webhooks.add({
                            event,
                            target_url: targetUrl,
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
                            target_url: targetUrl,
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
                    
                    this.registerWebhook(event, (payload: any) => this.handleEventCallback(event, payload));

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
            this.webhooks.delete(event);
            this.storage.save(this.webhookIds);
            logger.info(`Webhook für Event "${event}" gelöscht.`);
        } else {
            logger.warn(`Kein Webhook für Event "${event}" gefunden.`);
        }
    }

    processWebhook(event: string, payload: WebhookPayload): WebhookResponse {
        const callback = this.webhooks.get(event);
        if (callback) {
            logger.debug(`Verarbeite Webhook für Event "${event}".`);
            return callback(payload);
        } else {
            logger.warn(`Kein Webhook für Event "${event}" registriert.`);
            return {
                Status: 'Error',
                Message: `Kein Webhook für Event "${event}" registriert.`
            };
        }
    }
}

export default WebhookService;