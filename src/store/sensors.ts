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
import { ISensorService } from '@/services/sensor-service';
import { Descriptor, SensorData, SensorLog } from '@/models/sensor-data';
import { Sensor } from '@/models/sensor';
import { Location } from '@/features/locations/location';

import { log } from '@/services/logger';
import { Vue  } from 'vue-property-decorator';

export class Sensors  {
    // Reactive
    public mAll: Sensor[] = [];
    private mError = false;
    private mErrorMessage = '';

    // Not reactive
    private firstTime = true;

    constructor(private sensorService: ISensorService) {
        this.sensorService.addListener(this.parseSensorLog.bind(this));
    }
    public reset(): void {
        this.error = false;
        this.all = [];
        this.errorMessage = '';
        this.firstTime = true;
    }
    public get all(): Sensor[] {
        return this.mAll;
    }
    public set all(value: Sensor[]) {
        Vue.set(this, 'mAll', value);
    }
    public get length(): number {
        return this.mAll.length;
    }
    public get error(): boolean {
        return this.mError;
    }
    public set error(value: boolean) {
        Vue.set(this, 'mError', value);
    }
    public get errorMessage(): string {
        return this.mErrorMessage;
    }
    public set errorMessage(value: string) {
        Vue.set(this, 'mErrorMessage', value);
    }
    public loadSensors(samples: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sensorService.getSensorsSamples(samples)
            .then((response: SensorData[]) => {
                this.parseSensorData(response);
                resolve();
            })
            .catch((error) => {
                this.error = true;
                this.errorMessage = error;
                reject(error);
            });

        });
    }
    public getSensorsFrom(from: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sensorService.getSensorsFrom(from)
            .then((response: SensorData[]) => {
                this.parseSensorData(response);
                resolve();
            })
            .catch((error) => {
                this.error = true;
                this.errorMessage = error;
                reject(error);
            });
        });
    }
    public getSensorsSamples(samples: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sensorService.getSensorsSamples(samples)
            .then((response: SensorData[]) => {
                this.parseSensorData(response);
                resolve();
            })
            .catch((error) => {
                this.error = true;
                this.errorMessage = error;
                reject(error);
            });
        });
    }
    // getSensorSamples(desc: Descriptor): Promise<Data[]>

    public find(desc: Descriptor): Sensor | undefined {
        const found = this.all.find((s) =>
        s.desc.SN === desc.SN && s.desc.port === desc.port);

        if (!found) {
            log.debug('sensors.find: nothing found');
            return;
        } else {
            log.debug('sensors.find: ' + JSON.stringify(found.desc));
            return found as Sensor;
        }
    }
    public filterByDeviceID(deviceID: string): Sensor[] {
        return this.all.filter((item) => item instanceof Sensor && item.deviceID === deviceID) as Sensor[];
    }
    public allSensors(): Sensor[] {
        return this.all.filter((item) => item instanceof Sensor) as Sensor[];
    }
    public index(id: number): Sensor | undefined {
        if (0 <= id && id < this.all.length) {
            return this.all[id];
        } else {
            return undefined;
        }
    }
    public isSensor(): boolean {
        return this instanceof Sensor;
    }
    public indexOf(item: Sensor, fromIndex?: number): number {
        return this.all.indexOf(item, fromIndex);
    }
    public clearError() {
        this.errorMessage = '';
        this.error = false;
    }
    public getSensorsLast24h(): Promise<void> {
        const ms = 1000;
        const replaceEarlierSamples = true;
        return this.getSensorsLast(24 * 60 * 60 * ms, replaceEarlierSamples);
    }
    public getSensorsLast(period: number, replace = false): Promise<void> {
        return new Promise((resolve, reject) => {
            log.debug('sensors.getSensorsLast, lastPeriod:' + period + ' ms');
            this.sensorService.getSensorsFrom(Date.now() - period)
            .then ((response: SensorData[]) => {
                log.debug('sensors.getSensorsLast, , response length:' + response.length);
                this.parseSensorData(response, replace);
                resolve();
            })
            .catch((error) => {
                log.debug('sensors.getSensorsLast' + JSON.stringify(error));
                reject(error);
            });
        });

    }
    public AddLocation(location: Location) {
        location.sensors.forEach((s) => s.locationId = location._id);
    }
    public removeLocation(location: Location) {
        this.all.forEach((s) => {
            if (s.locationId === location._id) {
                s.locationId = '';
            }
        });
    }
    public setLocation(location: Location) {
        this.removeLocation(location);
        this.AddLocation(location);
    }
    private createSensor(sensorData: SensorData) {
        const newSensor = new Sensor (sensorData);
        this.all.push(newSensor);
        log.debug('Sensors.createSensor:: sensors.all=' + JSON.stringify(this.all));
    }
    private parseSensorData(response: SensorData[], replaceAllSamples = false) {
        response.forEach((sensorData) => {
            const found = this.find(sensorData.desc);
            if (!found) {
                this.createSensor(sensorData);
            } else if (replaceAllSamples) {
                found.samples = [];
                for (const sample of sensorData.samples) {
                    found.samples.push(sample); 
                }
            } else {
                let pushedSamples = 0;
                for (const sample of sensorData.samples) {
                    if (found.samples.length === 0 || sample.date > found.samples[found.samples.length - 1].date) {
                        pushedSamples ++;
                        found.samples.push(sample);
                    }
                }
                log.debug('Sensors.parseSensorData: found samples ' + found.samples.length + 
                          ', parsed samples ' + sensorData.samples.length + ', pushed samples ' + pushedSamples);
                return;
            }
        });
    }
    private parseSensorLog(sensorLog: SensorLog) {
        const found = this.find(sensorLog.desc);
        if (found) {
            log.info('Sensors.parseSensorLog: NOT IMPLEMENTED, samples=' + sensorLog.samples.length);
            // for (const sample of sensorLog.samples) {
            //     found.samples.push(sample);
            // }
        } else {
            log.error('Sensors.parseSensorLog: no sensor found, desc=' + JSON.stringify(sensorLog.desc));
        }
    }
}

