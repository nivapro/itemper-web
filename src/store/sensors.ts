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
import { Descriptor, SensorData } from '@/models/sensor-data';
import { Sensor } from '@/models/sensor';
import { SensorProxy } from '@/models/sensor-proxy';

import { store } from '@/store/store';

import { log } from '@/services/logger';
import { Vue  } from 'vue-property-decorator';

export class Sensors  {
    // Reactive
    public mAll: Array<Sensor | SensorProxy> = [];
    private mError: boolean = false;
    private mErrorMessage: string = '';

    // Not reactive
    private sensorService: ISensorService;
    private firstTime: boolean = true;

    constructor(sensorService: ISensorService) {
        log.debug('Sensor sensorService' + (sensorService !== undefined));
        this.sensorService = sensorService;
    }
    public reset(): void {
        this.error = false;
        this.all = [];
        this.errorMessage = '';
        this.firstTime = true;
    }
    public get all(): Array<Sensor | SensorProxy> {
        return this.mAll;
    }
    public set all(value: Array<Sensor | SensorProxy>) {
        Vue.set(this, 'mAll', value);
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

    public find(desc: Descriptor): Sensor | SensorProxy | undefined {
        return this.all.find((s) =>
        s.desc.SN === desc.SN && s.desc.port === desc.port);
    }

    public filterByDeviceID(deviceID: string): Sensor[] {
        return this.all.filter((item) => item instanceof Sensor && item.deviceID === deviceID) as Sensor[];
    }
    public allSensors(): Sensor[] {
        return this.all.filter((item) => item instanceof Sensor) as Sensor[];
    }
    public index(id: number): Sensor | SensorProxy | undefined {
        if (0 <= id && id < this.all.length) {
            return this.all[id];
        } else {
            return undefined;
        }
    }
    public isSensor(): boolean {
        return this instanceof Sensor;
    }
    public indexOf(item: Sensor | SensorProxy, fromIndex?: number): number {
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
        const self = this;
        this.sensorService.getSensorsFrom(Date.now() - period)
        .then ((response: SensorData[]) => {
            log.debug('getSensorsLast response.length=' + response.length);
            if (this.firstTime ) {
                this.firstTime = false;
            }
            this.parseSensorData(response);
        })
        .catch((error: any) => {
            log.debug('getSensorData' + JSON.stringify(error));
        });
    }
    private createSensor(sensorData: SensorData) {
        const newSensor = new Sensor (sensorData);
        this.all.push(newSensor);
        log.debug('Sensors.createSensor:: sensors.all=' + JSON.stringify(this.all));
    }

    private upgradeProxy(proxy: SensorProxy, sensorData: SensorData) {
        const newSensor = new Sensor (sensorData);
        this.all[this.indexOf(proxy)] = newSensor;
        log.debug('Sensors.upgradeProxy: sensors.all=' + JSON.stringify(this.all));
    }

    private parseSensorData(response: SensorData[]) {
        response.forEach((sensorData) => {
            const found = this.find(sensorData.desc);
            if (!found) {

                this.createSensor(sensorData);
            } else if (found instanceof SensorProxy) {
                this.upgradeProxy(found, sensorData);
            } else {
                for (const sample of sensorData.samples) {
                    (found as Sensor).samples.push(sample);
                }
            }
        });
    }
}

