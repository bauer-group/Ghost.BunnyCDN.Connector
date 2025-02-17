export interface WebhookPayload {
    event: string;
    data: Record<string, any>;
}

export interface WebhookResponse {
    status: string;
    message: string;
}