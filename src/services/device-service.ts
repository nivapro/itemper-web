import { Device, DeviceData } from '@/features/devices';

import { IApiService, Method } from '@/services/api-service';

export interface IDeviceService {
        getDevices(): Promise<DeviceData[]>;
        createDevice(name: string, color: string): Promise<DeviceData>;
        renameDevice(name: string, device: Device): Promise<DeviceData>;
        updateColor(color: string, device: Device): Promise<DeviceData>;
        deleteDevice(device: Device): Promise<DeviceData>;
}

export class DeviceService implements IDeviceService {

    private api: IApiService;
    private path = '/devices';
    constructor(apiService: IApiService) {
        this.api = apiService;
    }

    public getDevices(): Promise<DeviceData[]> {
        const method: Method = 'get';
        return this.api.request(method, this.path);
    }
    public createDevice(name: string, color: string): Promise<DeviceData> {
        const method: Method = 'post';
        return this.api.request(method, this.path, {name, color});
    }
    public renameDevice(name: string, device: Device): Promise<DeviceData> {
        const path = this.path + '/' + device.deviceID + '/name';
        const method: Method = 'put';
        return this.api.request(method, path, {name});
    }
    public updateColor(color: string, device: Device): Promise<DeviceData> {
        const path = this.path + '/' + device.deviceID + '/color';
        const method: Method = 'put';
        return this.api.request(method, path, {color});
    }
    public deleteDevice(device: Device): Promise<DeviceData> {
        const path = this.path + '/' + device.deviceID;
        const method: Method = 'delete';
        return this.api.request(method, path);
    }
}
