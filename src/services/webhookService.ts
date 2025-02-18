import GhostAdminAPI from '@tryghost/admin-api';
import Config from '../config/config';
import Storage from '../utils/storage';
import logger from '../utils/logger';
import { WebhookPayload, WebhookResponse } from '../interfaces/webhookInterfaces';
import BunnyNetService from './bunnyNetService';

/**
 * WebhookService class to manage webhook registrations and processing.
 */
class WebhookService {
    private ghostAdminAPI: any;
    private ghostWebhookSecret: string;
    private ghostWebhookTarget: string;
    private webhookIds: { [key: string]: string } = {};
    private storage: Storage;
    private webhookCallbacks: { [key: string]: (payload: any) => void } = {}; // Store callbacks
    private bunnyNetService: BunnyNetService;

    /**
     * Constructor for WebhookService.
     */
    constructor() {
        this.ghostAdminAPI = new GhostAdminAPI({
            url: Config.GHOST_URL,
            key: Config.GHOST_ADMIN_API_SECRET,
            version: 'v5.0'
        });
        this.ghostWebhookSecret = Config.GHOST_WEBHOOK_SECRET;
        this.ghostWebhookTarget = Config.GHOST_WEBHOOK_TARGET;
        this.storage = new Storage('/data/webhook_ids.json');
        this.webhookIds = this.storage.load() || {};
        this.bunnyNetService = new BunnyNetService();
    }

    /**
     * Initializes the required webhooks in Ghost.
     */
    public async initializeWebhooks() {
        const requiredWebhooks = Config.RequiredWebhooks;
        let successfulCount = 0;
        let failedWebhooks: string[] = [];

        for (const event of requiredWebhooks) {
            try {
                const targetUrl = `${this.ghostWebhookTarget}/webhook/${event.replace(/\./g, '-')}`;

                if (!this.webhookIds[event]) {
                    // Create webhook
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
                        logger.info(`Webhook for event "${event}" added.`);
                    } else {
                        logger.error(`Failed to add webhook for event "${event}": Invalid response from server.`);
                        failedWebhooks.push(event);
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
                        logger.info(`Webhook for event "${event}" updated.`);
                    } else {
                        logger.error(`Failed to update webhook for event "${event}": Invalid response from server.`);
                        failedWebhooks.push(event);
                    }
                }

                this.registerWebhook(event, (payload: any) => this.handleEventCallback(event, payload));

            } catch (error: any) {
                logger.error(`Failed to register webhook for event "${event}": ${error.message}`);
                failedWebhooks.push(event);
            }
        }
        this.storage.save(this.webhookIds);

        if (failedWebhooks.length > 0) {
            logger.warn(`Failed to initialize/update the following webhooks: ${failedWebhooks.join(', ')}`);
        }

        logger.info(`✅ Successfully initialized ${successfulCount} of ${requiredWebhooks.length} webhooks.`);
    }

    /**
     * Deinitializes the registered webhooks in Ghost.
     */
    public async deinitializeWebhooks() {
        const requiredWebhooks = Config.RequiredWebhooks;
        let successfulCount = 0;
        let failedWebhooks: string[] = [];

        for (const event of Object.keys(this.webhookIds)) {
            try {
                const webhookId = this.webhookIds[event];
                if (webhookId) {
                    await this.ghostAdminAPI.webhooks.delete({ id: webhookId });
                    successfulCount++;
                    logger.info(`Webhook for event "${event}" deleted.`);
                } else {
                    logger.warn(`No webhook ID found for event "${event}". Skipping deletion.`);
                }
                delete this.webhookIds[event]; // Remove from local storage
            } catch (error: any) {
                logger.error(`Failed to delete webhook for event "${event}": ${error.message}`);
                failedWebhooks.push(event);
            }

            this.deregisterWebhook(event); // Remove callback
        }

        this.storage.save(this.webhookIds); // Update storage after deletion
        if (failedWebhooks.length > 0) {
            logger.warn(`Failed to delete the following webhooks: ${failedWebhooks.join(', ')}`);
        }

        logger.info(`✅ Successfully deinitialized ${successfulCount} of ${requiredWebhooks.length} webhooks.`);
    }


    /**
     * Processes an incoming webhook event.
     * @param event The event name.
     * @param payload The webhook payload.
     * @returns A WebhookResponse object.
     */
    public processWebhook(event: string, payload: WebhookPayload): WebhookResponse {
        logger.debug(`Processing webhook event: ${event} with payload: ${JSON.stringify(payload)}`);

        try {
            if (this.webhookCallbacks[event]) {
                this.webhookCallbacks[event](payload); // Invoke the callback
                return { Status: 'Success', Message: `Event "${event}" processed.` };
            } else {
                logger.warn(`No callback registered for event: ${event}`);
                return { Status: 'Warning', Message: `No callback registered for event: ${event}` };
            }
        } catch (error: any) {
            logger.error(`Error executing callback for event ${event}: ${error.message}`);
            return { Status: 'Error', Message: `Error processing event: ${event}` };
        }
    }

    /**
     * Registers a callback function for a specific event.
     * @param event The event name.
     * @param callback The callback function to be executed when the event is received.
     */
    private registerWebhook(event: string, callback: (payload: any) => void) {
        this.webhookCallbacks[event] = callback; // Store the callback
        logger.debug(`Registered callback for event: ${event}`);
    }

    private deregisterWebhook(event: string) {        
        if (this.webhookCallbacks[event]) {
            delete this.webhookCallbacks[event];
            logger.debug(`Deregistered callback for event: ${event}`);
        }
    }   

    private handleEventCallback(event: string, payload: any) {
        logger.debug(`Event callback "${event}" with payload: ${JSON.stringify(payload)} triggered`);
        
        
        const { post, page } = payload;

        if (event === 'site.changed') {
            //xxxxxxxxxx
            return;
        }
    
        if (!((post && post.url) || (page && page.url))) {
            const url = post?.url || page?.url;
            this.bunnyNetService.purgeCache(url);
        }
    }
}

export default WebhookService;