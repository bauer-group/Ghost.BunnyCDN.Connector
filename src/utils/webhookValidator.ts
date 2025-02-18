import crypto from 'crypto';

export class WebhookValidator {
    private secret: string;

    constructor(secret: string) {
        if (!secret) {
            throw new Error('Secret must be provided');
        }
        this.secret = secret;
    }

    public verify(body: any, signature: string): void {
        if (!body || !signature) {
            throw new Error('Body and signature must be provided');
        }

        const computedSignature = this.computeSignature(body);

        if (computedSignature !== signature) {
            throw new Error('Invalid webhook signature');
        }
    }

    private computeSignature(body: any): string {
        return crypto
            .createHmac('sha256', this.secret)
            .update(JSON.stringify(body))
            .digest('hex');
    }
}