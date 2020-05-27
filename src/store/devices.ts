import { IDeviceService } from '@/services/device-service';
import { Device, DeviceData } from '../features/devices/';
import { log } from '@/services/logger';
import { Vue  } from 'vue-property-decorator';

export class Devices  {
    public mError: string = '';
    public mDevices: Device[] = [];
    private deviceService: IDeviceService;

    constructor(deviceService: IDeviceService) {
        this.deviceService = deviceService;
    }
    public reset(): void {
        this.error = '';
        this.all = [];
    }
    public get all(): Device[] {
        return this.mDevices;
    }
    public set  all(value: Device[]) {
        Vue.set(this, 'mDevices', value);
    }
    public get error(): string {
        return this.mError;
    }
    public set  error(value: string) {
        Vue.set(this, 'mError', value);
    }
    public getDevices(): void {
        this.resetError();
        this.deviceService.getDevices()
        .then((response: DeviceData[]) => {
            response.forEach((device) => {
                const deviceFound = this.mDevices.find((d) => d.deviceID === device.deviceID);
                if (!deviceFound) {
                    const newDevice = new Device(device.name, device.deviceID);
                    newDevice.key = device.key;
                    this.mDevices.push(newDevice);
                }
            });
        })
        .catch((e) => this.handleError(e));
    }
    public createDevice(name: string): Promise<Device> {
        this.resetError();
        return new Promise ((resolve, reject) => {
            this.deviceService.createDevice(name)
            .then((response) => {
                const newDevice = new Device(response.name, response.deviceID);
                newDevice.key = response.key;
                this.all.push(newDevice);
                resolve(newDevice);
            })
            .catch((e) => reject(e));
        });
    }
    public renameDevice(name: string, device: Device): Promise<Device> {
        return new Promise((resolve, reject) => {
            this.resetError();
            this.deviceService.renameDevice(name, device)
            .then((response: DeviceData) => {
                const thisDevice = this.all.find((d) => d.deviceID === response.deviceID);
                if (!thisDevice) {
                    reject({status: 95, message: 'Device id not available'});
                } else {
                    thisDevice.name = response.name;
                    resolve(thisDevice);
                }
            } )
            .catch((e) => this.handleError(e));
        });
    }
    public deleteDevice(device: Device): void {
        this.resetError();
        this.deviceService.deleteDevice(device)
        .then((response: DeviceData) => {
            const index = this.all.indexOf(device);
            if (index >= 0 && this.all[index].deviceID === response.deviceID) {
                const deleted = this.all[index];
                this.all.splice(index, 1);
            }
        })
        .catch((e) => this.handleError(e));
    }
    private resetError() {
        this.mError = '';
    }
    private handleError(e: any) {
        if (e.response) {
            this.mError = e.response.data;
        } else if (e.request) {
            this.mError = 'No response from server';
        } else {
            this.mError = e.message;
        }
        setTimeout(this.resetError, 1000 * 5);
    }
}

