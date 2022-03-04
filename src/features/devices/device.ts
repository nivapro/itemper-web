import {Storage } from '../../services/storage-service';
import { Vue } from 'vue-property-decorator';

import { DeviceData } from './device-data';

export class Device {
    private mName = '';
    private mDeviceID = '';
    private mKey = '';
    private mColor = '';
    private mColorID = 0;
    private keyStorage: Storage<string>;

    constructor(name: string, color: string, id: string) {
        this.mName = name;
        this.mDeviceID = id;
        this.mColorID = Math.floor(Math.random() * 6);
        this.mColor = color;
        this.keyStorage = new Storage<string>('itemper-' + id);
        const item =  this.keyStorage.getItem();
        if (item) {
            this.mKey = item;
        }
    }
    public get name(): string {
        return this.mName;
    }
    public set name(value: string) {
        Vue.set(this, 'mName', value);
    }
    public get color(): string {
        return this.mColor;
    }
    public set color(value: string) {
        Vue.set(this, 'mColor', value);
    }
    public get deviceID(): string {
        return this.mDeviceID;
    }
    public set deviceID(value: string) {
        Vue.set(this, 'mDeviceID', value);
    }
    public get key(): string {
        return this.mKey;
    }
    public set key(value: string) {
        this.keyStorage.setItem(value);
        Vue.set(this, 'mKey', value);
    }
    public get colorID(): number {
        return this.mColorID;
    }
    public set colorID(value: number) {
        Vue.set(this, 'mColorID', value);
    }
    public toDeviceData(): DeviceData {
        return {name: this.name, color: this.color, deviceID: this.deviceID, key: this.key };
    }
}
