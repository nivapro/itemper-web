import { log } from '@/services/logger';
import { iTemperWS } from '@/config';
import { IApiService } from '@/services/api-service';

export interface Message {
    command: string;
    data?: unknown;
}
export interface IWebSocketService {
    on(type: string, cb: (data?: unknown) => void): void;
    send(message: Message): void;
}
export type callback = (data: unknown) => void;

export class WebSocketService implements IWebSocketService {
    private socket: WebSocket | undefined = undefined;
    private RECONNECT_DELAY = 30_000;
    private subscribers: Map<string, Set<callback>> = new Map();
    private websocketAuthorized = false;
    private messageCount = 0;

    constructor(private apiService: IApiService) {
        this.apiService.addListener((userLoggedIn) => {
            if (userLoggedIn) {
                this.socket = this.setup();
            } else {
                this.socket = this.disconnect();
            }
        });
    }
    public authorizeWebSocket() {
        if (this.apiService.isLoggedIn && this.socket) {
            log.debug('authorizeWebSocket: authorization');
            const authorization: Message = {
                command: 'authorization',
                data: this.apiService.Authorization().value,
            };
            this.socket.send(JSON.stringify(authorization));
        } else {
            log.debug('authorizeWebSocket: not logged in');
        }
    }
    public on(type: string, cb: callback): void {
        let callbackSet: Set<callback> | undefined = this.subscribers.get(type);
        if (!callbackSet) {
            callbackSet = new Set();
            this.subscribers.set(type, callbackSet);
        }
        callbackSet.add(cb);
    }
    public send(message: Message): void {
        if (this.websocketAuthorized && this.socket && this.socket.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify(message);
            log.info('websocket-service.send: msg=' + msg);
            this.socket.send(msg);
        }
    }
    public get MessageCount() {
        return this.messageCount;
    }
    private setup(): WebSocket {
        const url = iTemperWS;
        const socket = new WebSocket(url);
        this.websocketAuthorized = false;

        log.info('websocket-service.setup: url=' + url);
        socket.onopen = (event) => {
            log.info('websocket-service.onopen: event=' + JSON.stringify(event));
            this.authorizeWebSocket();
        };
        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (!!msg && !!msg.command ) {
                    if (msg.command === 'authorize') {
                        log.info('websocket-service.onmessage: authorize');
                        this. authorizeWebSocket();
                    } else if (msg.command === 'authorized') {
                        log.info('websocket-service.onmessage: authorized');
                        this.websocketAuthorized = true;
                        const startMonitoring = {command: 'startMonitor'};
                        this.send(startMonitoring);
                    } else {
                        log.info('websocket-service.onmessage: ' + msg.command);
                        this.emit(msg.command, msg?.data);
                    }
                }
            } catch {
                log.error('websocket-service.onMessage: invalid message=' + JSON.stringify(event.data));
            }
        };
        socket.onerror = (event) => {
            log.error('websocket-service.onerror: event=' + JSON.stringify(event));
        };
        socket.onclose = (event) => {
            log.error('websocket-service.onclose: event=' + JSON.stringify(event));
            this.websocketAuthorized = false;
            this.reconnect();
        };
        return socket;
    }
    private emit(type: string, data: unknown) {
        this.messageCount++;
        this.subscribers.get(type)?.forEach((cb) => {
            cb(data);
        });
    }

    private disconnect() {
        this.websocketAuthorized = false;
        if (this.socket && (this.socket.readyState === this.socket.CONNECTING ||
            this.socket.readyState === this.socket.OPEN)) {
            this.socket.close();
        }
        return undefined;
    }
    private reconnect() {
        const delay = this.RECONNECT_DELAY * Math.random();
        log.info('websocket-service.reconnecting in ' + (delay / 1000).toPrecision(2) + 's');
        setTimeout(() => this.socket = this.setup(), delay);
    }
}
