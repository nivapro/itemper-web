import { UserCredentials } from '@/features/user/user-credentials';
import { IApiService } from '@/services/api-service';
import { Vue  } from 'vue-property-decorator';
import { log } from '@/services/logger';
import { useState } from '@/store/store';

export enum Status {
    LOGGED_OUT,
    LOGGING_IN,
    LOGGED_IN,
}
export class User  {
    public mFirstName: string = '';
    public mLastName: string = '';
    public credentials: UserCredentials;
    private mStatus: Status = Status.LOGGED_OUT;
    private api: IApiService;

    constructor(apiService: IApiService) {
        log.debug('user.ts constructor' + JSON.stringify(apiService));
        this.api = apiService;
        this.credentials = new UserCredentials();
    }
    public reset(): void {
        this.mFirstName = '';
        this.mLastName = '';
        this.credentials = new UserCredentials();
        this.status = Status.LOGGED_OUT;
    }
    public isLoggedIn(): boolean {
        return this.status === Status.LOGGED_IN;
    }
    public isLoggedOut(): boolean {
        return this.status === Status.LOGGED_OUT;
    }
    public get status() {
        return this.mStatus;
    }
    public set status(value: Status) {
        Vue.set(this, 'mStatus', value);
    }
    public register(): Promise<Status> {
        log.debug('user.register');
        this.status = Status.LOGGING_IN;
        return new Promise<Status> ((resolve, reject) => {
            this.api.register(this.credentials.email, this.credentials.password, this.credentials.password)
            .then((cred) => {
                this.status = Status.LOGGED_IN;
                resolve(this.status);
            })
            .catch((error: any) => {
                reject(error);
            });
        });
    }
    public login(): Promise<Status> {
        log.debug('user.login');
        this.status = Status.LOGGING_IN;
        return new Promise<Status> ((resolve, reject) => {
            this.api.login(this.credentials.email, this.credentials.password)
            .then((cred) => {
                this.status = Status.LOGGED_IN;
                resolve(this.status);
            })
            .catch((error: any) => {
                reject(error);
            });
        });
    }
    public logout(): Promise<Status> {
        log.debug('user.logout');
        return new Promise<Status> ((resolve, reject) => {
            this.status = Status.LOGGED_OUT;
            this.credentials.token = '';
            this.api.logout();
            resolve(this.status);
        });
    }
}

