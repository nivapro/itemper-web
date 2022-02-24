import { LogLevel } from '@/models/admin';

import { IApiService, Method } from '@/services/api-service';

export interface IAdminService {
        setLogLevel(level: LogLevel): Promise<boolean>;
}

export class AdminService implements IAdminService {

    private api: IApiService;
    private path = '/admin';
    constructor(apiService: IApiService) {
        this.api = apiService;
    }
    public setLogLevel(newLevel: LogLevel): Promise<boolean> {
        const method: Method = 'put';
        const path = this.path;
        const body = { level: LogLevel[newLevel] };
        return this.api.request(method, path, body);
    }
}
