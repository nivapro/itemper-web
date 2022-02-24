import { Storage } from '@/services/storage-service';

export interface IUserCredentialsStorage {
    email: string;
    password: string;
    token?: string;
}

export class UserCredentials implements IUserCredentialsStorage {
    public mEmail = '';
    public mPassword = '';
    public mConfirmPassword = '';
    public mToken = '';

    private mStorage: Storage<IUserCredentialsStorage>;

    constructor() {
        this.mToken = '';
        this.mStorage = new Storage<IUserCredentialsStorage>('itemper-key');
        const item =  this.mStorage.getItem();
        if (item) {
            this.mEmail = item.email ? item.email : '';
            this.mPassword = item.password ? item.password: '';
        }
    }

    public get email(): string {
        return this.mEmail;
    }

    public set email(value: string) {
        this.mEmail = value;
        this.store();
    }

    public get password(): string {
        return this.mPassword;
    }

    public set password(value: string) {
        this.mPassword = value;
        this.store();
    }

    public get confirmPassword(): string {
        return this.mConfirmPassword;
    }

    public set confirmPassword(value: string) {
        this.mConfirmPassword = value;
    }
    public hasEmail(): boolean {
        return this.mEmail.length > 0;
    }

    public hasPassword(): boolean {
        return this.mPassword.length > 0;
    }

    public get token(): string {
        return this.mToken;
    }

    public set token(value: string) {
        this.mToken = value;
        this.store();
    }
    private store() {
        const item = {email: this.email, password: this.password, token: this.token};
        this.mStorage.setItem(item);
    }

}
