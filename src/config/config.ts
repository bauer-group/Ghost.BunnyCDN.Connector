import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

class Config {
    public static GHOST_URL: string = process.env.GHOST_URL || 'http://localhost:2368';
    public static GHOST_ADMIN_API_SECRET: string = process.env.GHOST_ADMIN_API_SECRET || '';
    public static GHOST_WEBHOOK_SECRET: string = process.env.GHOST_WEBHOOK_SECRET || '';
    public static GHOST_WEBHOOK_TARGET: string = process.env.GHOST_WEBHOOK_TARGET || 'http://localhost:3000';

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

    public static Validate() {
        if (!this.GHOST_URL) {
            throw new Error('GHOST_URL ist nicht gesetzt');
        }
        if (!this.GHOST_ADMIN_API_SECRET) {
            throw new Error('GHOST_ADMIN_API_SECRET ist nicht gesetzt');
        }
        if (!this.GHOST_WEBHOOK_SECRET) {
            console.warn('GHOST_WEBHOOK_SECRET ist nicht gesetzt, ein zufälliger Wert wird generiert');
            this.GHOST_WEBHOOK_SECRET = crypto.randomUUID();
        }
        if (!this.GHOST_WEBHOOK_TARGET) {
            throw new Error('GHOST_WEBHOOK_TARGET ist nicht gesetzt');
        }
    }
}

export default Config;
