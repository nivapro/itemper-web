import { BaseStore } from '../../store/base-store';
import { ISensorService } from '@/services/sensor-service';
import { Category, Descriptor, Sample, SensorData, SensorLog } from '@/models/sensor-data';
import { store } from '@/store/store';

import { log } from '../../services/logger';

import { ref, Ref, UnwrapRef } from '@vue/composition-api';

export class SensorStore extends BaseStore<SensorData[]> {

    // Reactive
    private mError = ref(false);
    private mErrorMessage = ref('');

    // Not reactive
    private firstTime = true;

    constructor(private sensorService: ISensorService) {
        super();
        log.debug('sensor-store.constructor');
        this.sensorService.addListener(this.parseSensorLog.bind(this));
    }
    public get sensors(): UnwrapRef<SensorData[]> {
        return this.state;
    }
    public set sensors(value: SensorData[]) {
        this.state = value;
    }
    public get error(): Ref<boolean> {
        return this.mError;
    }
    public set error(value: Ref<boolean>) {
        this.mError = value;
    }
    public get errorMessage(): Ref<string> {
        return this.mErrorMessage;
    }
    public set errorMessage(value: Ref<string>) {
        this.mErrorMessage = value;
    }
    public getSensorsFrom(from: number) {
        this.sensorService.getSensorsFrom(from)
        .then((response: SensorData[]) => {
            this.parseSensorData(response);
        })
        .catch((error) => {
            this.error.value = true;
            this.errorMessage.value = error;
        });
    }
    public getSensorsSamples(samples: number) {
        this.sensorService.getSensorsSamples(samples)
        .then((response: SensorData[]) => {
            this.parseSensorData(response);
        })
        .catch((err: Error) => {
            this.error.value = true;
            this.errorMessage.value = err.message;
        });
    }
    // getSensorSamples(desc: Descriptor): Promise<Data[]>

    public find(desc: Descriptor): SensorData | undefined {
        const found = this.state.find((s) =>
        s.desc.SN === desc.SN && s.desc.port === desc.port);
        return found;
    }

    public clearError() {
        this.errorMessage.value = '';
        this.error.value = false;
    }
    public getSensorsLast24h() {
        const ms = 1000;
        const period = this.firstTime ? 24 * 60 * 60 * ms : 30 * ms ;
        this.getSensorsLast(period);
    }
    public getSensorsLast(period: number) {
        this.sensorService.getSensorsFrom(Date.now() - period)
        .then ((response: SensorData[]) => {
            log.debug('sensor-store.getSensorsLast response.length=' + response.length);
            if (this.firstTime ) {
                this.firstTime = false;
            }
            this.parseSensorData(response);
        })
        .catch((error: Error) => {
            log.debug('sensor-store.getSensorData' + JSON.stringify(error));
        });
    }
    protected data(): SensorData[] {
        return [] ;
    }
    protected setup(data: SensorData[]): void {
        log.debug('sensor-store.setup: data: ' + JSON.stringify(data));
        return;
    }
    private createSensor(sensorData: SensorData) {
        this.state.push(sensorData);
        log.debug('sensor-store.createSensor:: sensorData=' + JSON.stringify(sensorData));
    }
    private saveSamples(sensor: SensorData, samples: Sample[]) {
        if (sensor.samples.length === 0) {
            // This is the first sample(s), save all of them
            for (const sample of samples) {
                sensor.samples.push(sample);
            }
        } else {
            // Some samples exist already, save samples that are younger than
            // the last saved sensor sample
            for (const sample of samples) {
                if (sample.date > sensor.samples[sensor.samples.length - 1].date) {
                    sensor.samples.push(sample);
                }
            }
        }
    }
    private createProxy(sensorLog: SensorLog) {
        const sensorData: SensorData = {
            _id: '',
            deviceID: '',
            desc: sensorLog.desc,
            attr: {
                    model: 'proxy',
                    category: Category.Temperature,
                    accuracy: 2,
                    resolution: 2,
                    maxSampleRate: 5,
            },
            samples: sensorLog.samples,
        };
        this.state.push(sensorData);
    }
    private isValid(data: Partial<SensorData>): boolean {
        let valid = true;
        if (!data.desc) {
            log.debug('sensors-store.isValid: no desc');
            valid = false;
        } else if (!data.desc.SN === undefined || data.desc.port === undefined) {
            log.debug('sensors-store.isValid: no SN or port');
            valid = false;
        } else if (data.desc.SN === '' || data.desc.port < 0 || data.desc.port > 7) {
            log.debug('sensors-store.isValid: SN or port invalid');
            valid = false;
        }
        return valid;
    }
    private parseSensorData(response: SensorData[]) {
        response.forEach((sensorData) => {
            log.debug('sensors-store.parseSensorData, sensorData=' + JSON.stringify(sensorData));
            if (this.isValid(sensorData)) {
                log.debug('sensors-store.parseSensorData: valid data');
                const foundSensor = this.find(sensorData.desc);
                if (!foundSensor) {
                    log.debug('sensors-store.parseSensorData: create');
                    this.createSensor(sensorData);
                } else {
                    log.debug('sensors-store.parseSensorData: save samples');
                    this.saveSamples(foundSensor, sensorData.samples);
                }
            } else {
                log.debug('sensors-store.parseSensorData: Invalid data');
            }
        });
    }
    private parseSensorLog(sensorLog: SensorLog) {
        const found = this.find(sensorLog.desc);
        if (!found) {
            this.createProxy(sensorLog);
        } else  {
            log.debug('sensors-store..parseSensorData: push samples + ' + sensorLog.samples.length);
            for (const sample of sensorLog.samples) {
                found.samples.push(sample);
            }
            return;

        }
    }
}
let state: SensorStore;
export function useSensors() {
    if (!state) {
        state = new SensorStore(store.itemper.sensorService);
    }
    return state;
}
