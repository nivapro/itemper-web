
import { SensorData, SensorLog } from '@/models/sensor-data';
import {  isSensorDataArrayValid, isSensorLogValid } from '@/models/sensor-data-validators';

import { json } from '@/helpers';
import { log } from '@/services/logger';
import { IApiService, Method } from '@/services/api-service';
import { IWebSocketService } from '@/services/websocket-service';

export type SensorLogListener = (data: SensorLog) => void;
export interface ISensorService {
        addListener(listener: SensorLogListener): void;
        getSensorsSamples(samples: number): Promise<SensorData[]>;
        getSensorsFrom(from: number): Promise<SensorData[]>;
}

export class SensorService implements ISensorService {
        private static listeners: Set<SensorLogListener> = new Set();

        private path = '/sensors';
        constructor(private api: IApiService, private wss: IWebSocketService) {
                this.ListenOnSensorLog();

        }
        public addListener(listener: SensorLogListener): void {
                if (!SensorService.listeners.has(listener)) {
                        SensorService.listeners.add(listener);
                }
        }
        public getSensorsSamples(samples = 1): Promise<SensorData[]> {
                const path = this.path + '?samples=' + samples;
                return this.getSensors(path);
        }
        public getSensorsFrom(from: number): Promise<SensorData[]> {
                const path = this.path + '?from=' + from;
                return this.getSensors(path);
        }
        private getSensors(path: string): Promise<SensorData[]> {
                log.debug('SensorService.getSensors: path=' + path);
                const method: Method = 'get';
                return new Promise<SensorData[]> ((resolve) => {
                        this.api.request(method, path)
                        .then ((data) => {
                                log.debug('SensorService.getSensors: response=' + json(data));
                                if (isSensorDataArrayValid (data)) {
                                        resolve(data);
                                } else {
                                        log.error('SensorService.getSensors: received invalid sensor data');
                                        resolve([]);
                        }})
                        .catch (() => {
                                log.error('SensorService.getSensors: cannot get sensor data');
                                resolve([]);
                        });
                });
        }
        private ListenOnSensorLog() {
                this.wss.on('log', (data) => {
                        log.debug('SensorService.ListenOnSensorLog: data=' + json(data));
                        if (isSensorLogValid (data)) {
                                const sensorLog = data as SensorLog;
                                SensorService.listeners.forEach((callback) => {
                                        callback(sensorLog);
                                });
                        } else {
                                log.error('SensorService.ListenOnSensorLog: received invalid sensor log');
                        }
                });
        }
}
