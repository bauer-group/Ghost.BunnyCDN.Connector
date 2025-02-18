import dotenv from 'dotenv';
import crypto from 'crypto';
import logger from '../utils/logger';

dotenv.config();

/**
 * Configuration class to manage application settings.
 */
class Config {
    public static GHOST_URL: string = process.env.GHOST_URL || 'http://localhost:2368';
    public static GHOST_ADMIN_API_SECRET: string = process.env.GHOST_ADMIN_API_SECRET || '';
    public static GHOST_WEBHOOK_SECRET: string = process.env.GHOST_WEBHOOK_SECRET || crypto.randomBytes(20).toString('hex'); // Generate random secret if not set
    public static GHOST_WEBHOOK_TARGET: string = process.env.GHOST_WEBHOOK_TARGET || 'http://localhost:3000';
    public static BUNNYCDN_API_KEY: string = process.env.BUNNYCDN_API_KEY || '';

    public static RequiredWebhooks = [
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

    /**
     * Validates the required configuration parameters.
     * @throws {Error} If any required configuration parameter is missing.
     */
    public static Validate() {
        if (!this.GHOST_URL) {
            logger.error('GHOST_URL is not set');
            throw new Error('GHOST_URL is not set');
        }
        if (!this.GHOST_ADMIN_API_SECRET) {
            logger.error('GHOST_ADMIN_API_SECRET is not set');
            throw new Error('GHOST_ADMIN_API_SECRET is not set');
        }

        if (!this.GHOST_WEBHOOK_SECRET) {
            logger.warn('GHOST_WEBHOOK_SECRET is not set. Generating a random secret.  This is not suitable for production.');
        }

        if (!this.GHOST_WEBHOOK_TARGET) {
            logger.error('GHOST_WEBHOOK_TARGET is not set');
            throw new Error('GHOST_WEBHOOK_TARGET is not set');
        }

        if (!this.BUNNYCDN_API_KEY) {
            logger.error('BUNNYCDN_API_KEY is not set.');
            throw new Error('BUNNYCDN_API_KEY is not set');
        }
    }
}

export default Config;