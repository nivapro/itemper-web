// samples: [{
//     value: 33.6875,
//     date: 1522790348877,
// }],
// attr: {
//     model: 'TEMPer 8',
//     category: 'Temperature',
//     accuracy: 0.5,
//     resolution: 1,
//     maxSampleRate: 0.2,
// },
// desc: {
//     SN: 'Temper8',
//     port: 7,
// },
// },
import {Category, Sample, Attributes, Descriptor, SensorData} from '@/models/sensor-data';
import { Vue  } from 'vue-property-decorator';

export class Sensor implements SensorData {
    private mId = '';
    private mDeviceID = '';
    private mDesc: Descriptor = { SN: '', port: 0 };
    private mAttr: Attributes = {
        model: '', category: Category.Other, accuracy: 0, resolution: 0, maxSampleRate: 0,
    };
    private mSamples: Sample[] = [];
    private mLocationId = '';

    constructor(data: SensorData) {
            this.update(data);
    }
    public update(sensorData: SensorData) {
        this._id = sensorData._id;
        this.deviceID = sensorData.deviceID;
        this.desc = sensorData.desc;
        this.attr = sensorData.attr;
        for (const sample of sensorData.samples) {
            this.samples.push(sample);
        }
    }
    public get _id(): string {
        return this.mId;
    }
    public set _id(value: string) {
        Vue.set(this, 'mId', value);
    }
    public get deviceID(): string {
        return this.mDeviceID;
    }
    public set deviceID(value: string) {
        Vue.set(this, 'mDeviceID', value);
    }
    public get desc(): Descriptor {
        return this.mDesc;
    }
    public set desc(value: Descriptor) {
        Vue.set(this, 'mDesc', value);
    }
    public get samples(): Sample[] {
        return this.mSamples;
    }
    public set samples(value: Sample[]) {
        Vue.set(this, 'mSamples', value);
    }
    public get name(): string {
        return this.desc.SN + '/' + this.desc.port;
    }
    public get attr(): Attributes {
        return this.mAttr;
    }
    public set attr(value: Attributes) {
        Vue.set(this, 'mAttr', value);
    }
    public get lastValue(): string {
        if (this.hasSamples()) {
            return this.samples[this.samples.length - 1].value.toString();
        } else {
            return '-';
        }
    }
    public get lastTime(): string {
        if (this.hasSamples()) {
            return new Date(this.samples[this.samples.length - 1].date).toLocaleTimeString();
        } else {
            return '-';
        }
    }
    public get category(): Category {
        return this.attr.category;
    }
    public get model(): string {
        return this.attr.model;
    }
    public get accuracy(): number {
        return this.attr.accuracy;
    }
    public get resolution(): number {
        return this.attr.resolution;
    }
    public get maxSampleRate(): number {
        return this.attr.maxSampleRate;
    }
    public hasSamples(): boolean {
        return this.samples.length > 0;
    }
    public get lastSample(): Sample {
        return this.samples[this.samples.length];
    }
    public get locationId(): string {
        return this.mLocationId;
    }
    public set locationId(value: string) {
        Vue.set(this, 'mLocationId', value);
    }
}
