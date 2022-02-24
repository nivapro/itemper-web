/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {  Method, AxiosInstance, AxiosRequestConfig } from 'axios';

import { iTemperAPI } from '@/config';
import { json } from '@/helpers/';
import { log } from '@/services/logger';

export type ApiListener = (loggedIn: boolean) => void;
export interface IApiService {
    isLoggedIn: boolean;
    addListener(listener: ApiListener): void;
    register(email: string, password: string, confirmPassword: string): Promise<boolean>;
    login(email: string, password: string): Promise<boolean>;
    logout(): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request(method: Method, url: string, body?: unknown, config?: AxiosRequestConfig): Promise<any>;
    Authorization(): { value: string };
}

export interface IError {
    message: string;
    status: number;
}

export { Method } from 'axios';

export class ApiService implements IApiService {
    private static listeners: Set<ApiListener> = new Set();
    public mIsLoggedIn = false;

    private io: AxiosInstance;
    private token: string | undefined = undefined;
    private ContentTypeHeader = {'Content-Type': 'application/json'};

    constructor() {
        this.io = axios.create({
            baseURL: iTemperAPI,
            headers: this.ContentTypeHeader,
        });
    }
    public get isLoggedIn(): boolean {
        return this.mIsLoggedIn;
    }
    public set isLoggedIn(value: boolean) {
        this.mIsLoggedIn = value;
        ApiService.listeners.forEach((callback) =>
            callback(this.mIsLoggedIn));
    }
    public addListener(listener: ApiListener): void {
        if (!ApiService.listeners.has(listener)) {
            ApiService.listeners.add(listener);
        }
}
    public register(email: string, password: string, confirmPassword: string): Promise<boolean> {
        log.debug('api-service.register');
        const url = '/signup';
        const body = JSON.stringify({email, password, confirmPassword});
        return this.post(url, body);
    }
    public login(email: string, password: string): Promise<boolean> {
        log.debug('api-service.login');
        const url = '/login';
        const body = JSON.stringify({email, password});
        return this.post(url, body);
    }

    public logout() {
        log.debug('api-service.logout');
        this.token = undefined;
        this.isLoggedIn = false;
    }

    public request(method: Method, url: string, body?: any, config?: AxiosRequestConfig): Promise<any> {
        log.debug('api-service.request: ' + method.toUpperCase() + ' ' + url);
        return new Promise<any> ((resolve, reject) => {
            if (!this.isLoggedIn) {
                    reject('User is not logged');
            }
            let conf: AxiosRequestConfig;
            const Authorization = {Authorization: this.Authorization().value};
            if (config) {
                conf = config;
                conf.method = method;
                conf.url = url;
                if (conf.headers) {
                    conf.headers.Authorization = this.Authorization().value;
                } else {
                    conf.headers = Authorization;
                }
                if (body) {
                    conf.data = body;
                }
            } else {
                conf = {url, method, headers: Authorization, data: body};
            }
            this.io.request(conf)
            .then ((response) => {
                    const data = response.data;
                    resolve(data);
            })
            .catch((error: any) => {
                reject(this.createError(error));
            });
        });
    }
    public Authorization() {
        log.debug('api-service.Authorization');
        if (this.token) {
            return {value: 'Bearer ' + this.token};
        } else {
            return { value: 'Bearer '};
        }
    }
    private createError(error: any): IError {
        let message = 'Unknown error';
        let status = 99;
        if (error.message) {
            message =  error.message;
            status = 98;
        }
        if (error.response) {
            status  = error.response.status;
            if (status === 422) {
                message = 'Invalid field value(s)';
            } else {
                message = error.response.data;
            }
        } else if (error.request) {
            log.debug('api-service: request=' + error.request);
            message = error.request.data;
            status = error.request.status;
        } else {
            log.debug('api-service.request Error=' + error.message);
        }
        return {message, status};
    }
    private post(url: string, body: string): Promise<boolean> {
        return new Promise<boolean> ((resolve, reject) => {
            this.io.post(url, body)
            .then((response) => {
                log.debug(json(response));
                this.token = response.data.token;
                this.isLoggedIn = true;
                resolve(true);
            })
            .catch((error: any) => {
                this.isLoggedIn = false;
                reject(this.createError(error));
            });
        });
    }
}
