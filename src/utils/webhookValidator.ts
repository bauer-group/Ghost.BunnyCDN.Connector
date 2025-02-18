import crypto from 'crypto';
import logger from './logger';

export class WebhookValidator {
    private secret: string;

    constructor(secret: string) {
        if (!secret) {
            throw new Error('Secret must be provided');
        }
        this.secret = secret;
    }

    public verify(body: any, signature: string): void {        
        //logger.debug(`Signature Header: ${signature}`);

        if (!body || !signature) {
            throw new Error('Body and signature must be provided');
        }

        const [receivedSignature, receivedSignatureTimestamp] = signature.split(',').map(part => part.split('=')[1]);
        const computedSignature = this.computeSignature(body, receivedSignatureTimestamp);

        const receivedBuffer = Buffer.from(receivedSignature, 'utf8');
        const computedBuffer = Buffer.from(computedSignature, 'utf8');

        if (receivedBuffer.length !== computedBuffer.length) {
            throw new Error('Signature length mismatch');
        }

        if (!crypto.timingSafeEqual(receivedBuffer, computedBuffer)) {
            logger.debug(`Ghost Signatures: computed = ${computedSignature} | received = ${receivedSignature}`);
            throw new Error('Invalid webhook signature');
        }
    }

    private computeSignature(body: any, timestamp: string): string {
        return crypto
            .createHmac('sha256', this.secret)
            .update(`${JSON.stringify(body)}${timestamp}`, 'utf8')
            .digest('hex');
    }
}