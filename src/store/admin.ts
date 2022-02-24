import { Vue  } from 'vue-property-decorator';
import { LogLevel } from '@/models/admin';
import { IAdminService } from '@/services/admin-service';
export class Admin {

    public mError = '';
    private mLevel: LogLevel = LogLevel.error;
    private adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this.adminService = adminService;
    }
    public get level(): LogLevel {
        return this.mLevel;
    }
    public set level(value: LogLevel) {
        Vue.set(this, 'mLevel', value);
    }
    public get error(): string {
        return this.mError;
    }
    public set error(value: string) {
        Vue.set(this, 'mError', value);
    }
    public reset() {
        this.level = LogLevel.error;
        this.error = '';
    }
    public resetLevel(): Promise<boolean>  {
        return new Promise ((resolve, reject) => {
            this.adminService.setLogLevel(LogLevel.error)
            .then((updated: boolean) => {
                if (!updated) {
                    this.error =  'Log level could not be reset';
                    reject({status: 94, message: this.error});
                } else {
                    this.level = LogLevel.error;
                    resolve(true);
                }
            })
            .catch((e) => reject(e));
        });
    }

    public updateLevel(newLevel: LogLevel): Promise<boolean> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.adminService.setLogLevel(newLevel)
            .then((updated: boolean) => {
                if (!updated) {
                    this.error =  'Log level could not be updated';
                    reject({status: 94, message: this.error});
                } else {
                   this.level = newLevel;
                   resolve(true);
                }
            })
            .catch((e) => reject(e));
        });
    }
    private resetError() {
        this.error = '';
    }
}
