import { Descriptor } from '@/models/sensor-data';
import { Sensor } from '@/models/sensor';
import { Vue  } from 'vue-property-decorator';
export class Location  {
    public mId = '';
    public mName = '';
    public mColor = '';
    public mPath = '';
    public mSensorDesc: Descriptor[] = [];
    public mSensors: Sensor[] = [];
    constructor(name: string, color: string) {
        this.name = name;
        this.color = color;
    }
    public get _id(): string {
        return this.mId;
    }
    public set _id(value: string) {
        Vue.set(this, 'mId', value);
    }
    public get sensorDesc(): Descriptor[] {
        return this.mSensorDesc;
    }
    public set sensorDesc(value: Descriptor[]) {
        Vue.set(this, 'mSensorDesc', value);
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
    public get path(): string {
        return this.mPath;
    }
    public set path(value: string) {
        Vue.set(this, 'mPath', value);
    }
    public get sensors(): Sensor[] {
        return this.mSensors;
    }
    public set sensors(value: Sensor[]) {
        Vue.set(this, 'mSensors', value);
    }
    public addSensor(sensor: Sensor) {
        const existing = this.sensors.find((s) => s.desc.SN === sensor.desc.SN && s.desc.port === sensor.desc.port);
        if (!existing) {
            this.sensors.push(sensor);
        }
    }
    public removeSensor(sensor: Sensor) {
        const index = this.sensors.indexOf(sensor);
        if (index >= 0) {
            this.sensors.splice(index, 1);
        }
    }
    public removeSensorIndex(index: number) {
        if (0 <= index && index <  this.sensors.length) {
            this.sensors.splice(index, 1);
        }
    }
}
