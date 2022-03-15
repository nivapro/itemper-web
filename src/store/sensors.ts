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
import { store } from '@/store/store';

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
    public loadSensors(samples: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.sensorService.getSensorsSamples(samples)
            .then((response: SensorData[]) => {
                this.parseSensorData(response);
                resolve(true);
            })
            .catch((error) => {
                this.error = true;
                this.errorMessage = error;
                reject(error);
            });

        });
    }
    public getSensorsFrom(from: number) {
        this.sensorService.getSensorsFrom(from)
        .then((response: SensorData[]) => {
            this.parseSensorData(response);
        })
        .catch((error) => {
            this.error = true;
            this.errorMessage = error;
        });
    }
    public getSensorsSamples(samples: number) {
        this.sensorService.getSensorsSamples(samples)
        .then((response: SensorData[]) => {
            this.parseSensorData(response);
        })
        .catch((error) => {
            this.error = true;
            this.errorMessage = error;
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
    public getSensorsLast24h() {
        const ms = 1000;
        const period = this.firstTime ? 24 * 60 * 60 * ms : store.settings.interval * ms ;
        this.getSensorsLast(period);
    }
    public getSensorsLast(period: number) {
        this.sensorService.getSensorsFrom(Date.now() - period)
        .then ((response: SensorData[]) => {
            if (this.firstTime ) {
                this.firstTime = false;
            }
            this.parseSensorData(response);
        })
        .catch((error) => {
            log.debug('getSensorData' + JSON.stringify(error));
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
    private parseSensorData(response: SensorData[]) {
        response.forEach((sensorData) => {
            const found = this.find(sensorData.desc);
            if (!found) {
                this.createSensor(sensorData);
            } else {
                let pushedSamples = 0;
                for (const sample of sensorData.samples) {
                    if (found.samples.length === 0 || sample.date > found.samples[found.samples.length - 1].date) {
                        pushedSamples ++;
                        found.samples.push(sample);
                    }
                }
                log.debug('Sensors.parseSensorData: pushed samples ' + pushedSamples);
                return;
            }
        });
    }
    private parseSensorLog(sensorLog: SensorLog) {
        const found = this.find(sensorLog.desc);
        if (found) {
            log.info('Sensors.parseSensorLog: received samples=' + sensorLog.samples.length);
            for (const sample of sensorLog.samples) {
                found.samples.push(sample);
            }
        } else {
            log.error('Sensors.parseSensorLog: no sensor found, desc=' + JSON.stringify(sensorLog.desc));
        }
    }
}

