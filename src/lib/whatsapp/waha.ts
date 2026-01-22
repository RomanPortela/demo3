import { Logger } from '../logger';

const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const WAHA_SESSION_NAME = process.env.WAHA_SESSION_NAME || 'default';

export class WahaService {
    private baseUrl: string;
    private apiKey: string;
    private sessionName: string;

    constructor() {
        this.baseUrl = WAHA_URL;
        this.apiKey = WAHA_API_KEY;
        this.sessionName = WAHA_SESSION_NAME;
        Logger.info(`WahaService initialized`, {
            baseUrl: this.baseUrl,
            hasApiKey: !!this.apiKey,
            apiKeyLength: this.apiKey?.length,
            sessionName: this.sessionName
        });
    }

    getSessionName() {
        return this.sessionName;
    }


    private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
        const headers: Record<string, string> = { ...additionalHeaders };

        // Only add API key header if configured
        if (this.apiKey) {
            headers['X-Api-Key'] = this.apiKey;
        }

        return headers;
    }

    async getSessions() {
        try {
            const response = await fetch(`${this.baseUrl}/api/sessions`, {
                headers: this.getHeaders(),
            });
            return response.json();
        } catch (error) {
            Logger.error('Failed to get sessions', { error });
            throw error;
        }
    }

    async startSession(name: string = this.sessionName) {
        try {
            Logger.info(`Starting session: ${name}`);

            // 1. Try to "start" it if it already exists but is stopped
            const startResponse = await fetch(`${this.baseUrl}/api/sessions/${name}/start`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            if (startResponse.ok) {
                Logger.info(`Session ${name} started successfully (existing)`);
                return startResponse.json();
            }

            // 2. If it doesn't exist or /start fails, try to create it (POST /api/sessions)
            const createResponse = await fetch(`${this.baseUrl}/api/sessions`, {
                method: 'POST',
                headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ name }),
            });

            Logger.info(`Session ${name} create/start response status: ${createResponse.status}`);
            return createResponse.json();
        } catch (error) {
            Logger.error(`Failed to start session: ${name}`, { error });
            throw error;
        }
    }

    async getStatus(name: string = this.sessionName) {
        const headers = this.getHeaders();
        try {
            // Try to get session info first (more reliable in 3.0)
            const sessionResponse = await fetch(`${this.baseUrl}/api/sessions/${name}`, { headers });
            if (sessionResponse.ok) {
                const session = await sessionResponse.json();
                Logger.info(`WAHA session info for ${name}:`, session);

                // Deterministic status mapping
                let state = 'DISCONNECTED';
                if (session.status === 'RUNNING' || session.status === 'WORKING') {
                    // In WAHA 3.x, if session is RUNNING/WORKING and has 'me', it's CONNECTED
                    state = session.me ? 'CONNECTED' : 'STARTING';
                }

                return {
                    status: session.status,
                    state: session.metadata?.state || state,
                    me: session.me
                };
            }

            // Fallback to auth state
            const stateResponse = await fetch(`${this.baseUrl}/api/${name}/auth/state`, { headers });
            if (stateResponse.ok) {
                const stateData = await stateResponse.json();
                Logger.info(`WAHA auth state for ${name}:`, stateData);
                return stateData;
            }

            Logger.warn(`Session ${name} not found or status check failed`, { status: sessionResponse.status });
            return { state: 'DISCONNECTED' };
        } catch (error) {
            Logger.error(`Error checking status for session: ${name}`, { error });
            return { state: 'DISCONNECTED' };
        }
    }

    async getChats(name: string = this.sessionName) {
        try {
            Logger.info(`Fetching chats for session: ${name}`);
            // In WAHA 3.x, the endpoint is /api/{session}/chats
            const response = await fetch(`${this.baseUrl}/api/${name}/chats`, {
                headers: this.getHeaders(),
            });
            if (response.ok) {
                return response.json();
            }
            const errorText = await response.text();
            Logger.error(`Failed to fetch chats. Status: ${response.status}`, { errorText });
            return [];
        } catch (error) {
            Logger.error(`Error in getChats for session: ${name}`, { error });
            return [];
        }
    } async getMessages(chatId: string, limit: number = 50, name: string = this.sessionName) {
        try {
            Logger.info(`Fetching messages for chat ${chatId} (limit: ${limit})`);
            const response = await fetch(`${this.baseUrl}/api/${name}/chats/${chatId}/messages?limit=${limit}`, {
                headers: this.getHeaders(),
            });
            if (response.ok) {
                return response.json();
            }
            const errorText = await response.text();
            Logger.error(`Failed to fetch messages for ${chatId}. Status: ${response.status}`, { errorText });
            return [];
        } catch (error) {
            Logger.error(`Error in getMessages for ${chatId}`, { error });
            return [];
        }
    }


    async getQr(name: string = this.sessionName) {
        try {
            Logger.info(`Fetching QR for session: ${name}`);
            const response = await fetch(`${this.baseUrl}/api/${name}/auth/qr?format=raw`, {
                headers: this.getHeaders(),
            });

            if (response.ok) {
                // Check content type
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const data = await response.json();
                    Logger.info('QR received as JSON');
                    return { qr: data.value || data.qr || data };
                } else {
                    const text = await response.text();
                    Logger.info('QR received as text');
                    return { qr: text };
                }
            } else {
                const errorText = await response.text();
                Logger.error(`Failed to fetch QR. Status: ${response.status}`, {
                    errorText,
                    session: name,
                    tip: response.status === 422 ? "Session might be STOPPED or FAILED. Try starting it first." : "Unknown error"
                });
            }
        } catch (error) {
            Logger.error(`Error in getQr for session: ${name}`, { error });
        }
        return null;
    }

    async sendMessage(to: string, text: string, name: string = this.sessionName) {
        try {
            Logger.info(`Sending message to ${to} via session ${name}`);
            const response = await fetch(`${this.baseUrl}/api/sendText`, {
                method: 'POST',
                headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ chatId: `${to}@c.us`, text, session: name }),
            });
            return response.json();
        } catch (error) {
            Logger.error(`Failed to send message to ${to}`, { error });
            throw error;
        }
    }

    async logout(name: string = this.sessionName) {
        try {
            Logger.info(`Logging out session: ${name}`);
            const response = await fetch(`${this.baseUrl}/api/sessions/${name}/logout`, {
                method: 'POST',
                headers: this.getHeaders(),
            });
            return response.json();
        } catch (error) {
            Logger.error(`Failed to logout session: ${name}`, { error });
            throw error;
        }
    }

    async setupWebhooks(webhookUrl: string) {
        try {
            Logger.info(`Setting up webhooks for WAHA: ${webhookUrl}`);

            // In WAHA, we can configure webhooks via POST /api/webhooks
            const response = await fetch(`${this.baseUrl}/api/webhooks`, {
                method: 'POST',
                headers: this.getHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    url: webhookUrl,
                    events: [
                        'message',
                        'message.any',
                        'chat.archive',
                        'chat.unarchive',
                        'session.status'
                    ],
                    hmac: null
                }),
            });

            if (response.ok) {
                Logger.info('Webhooks registered successfully');
                return response.json();
            }

            const errorText = await response.text();
            Logger.error(`Failed to register webhooks. Status: ${response.status}`, { errorText });
            return { error: errorText, status: response.status };
        } catch (error) {
            Logger.error('Error setting up webhooks', { error });
            throw error;
        }
    }
}

export const waha = new WahaService();



