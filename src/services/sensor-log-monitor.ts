import { reactive } from '@vue/composition-api';
import { log } from '@/services/logger';
import { IWebSocketService } from '@/services/websocket-service';
import { Descriptor, SensorLog } from '@/models/sensor-data';

export type callback = (log: SensorLog) => void;

export type SubscribersMap = Map<string, Set<(log: SensorLog) => void>>;

export interface ISensorLogMonitor {
    subscribe (desc: Descriptor, publish: callback): void;
}
export class SensorLogMonitor implements ISensorLogMonitor {
    private subscribers: SubscribersMap = reactive(new Map());
    private count = 0;

    public get Subscribers(): SubscribersMap {
        return this.subscribers;
    }

    public get Count(): number{
        return this.count;
    }
    constructor(private socket: IWebSocketService) {
        socket.on('log', this.parseSensorLog);
    }
    public sensorDesc(desc: Descriptor): string {
        return desc.SN + '/' + desc.port;
    }
    public subscribe(desc: Descriptor, publish: callback): void {
        const sensorDesc = this.sensorDesc(desc);
        log.debug('sensor-log-monitor.subscribe: sensorDesc=' + sensorDesc);

        let callbackSet: Set<callback> | undefined =  this.subscribers.get(sensorDesc);
        if (!callbackSet) {
            callbackSet = new Set();
            this.subscribers.set(sensorDesc, callbackSet);
        }
        callbackSet.add(publish);
        this.count++;
    }
    public unSubscribe(desc: Descriptor, callback: callback): void {
        const sensorDesc = this.sensorDesc(desc);
        const callbackSet: Set<callback> | undefined =  this.subscribers.get(sensorDesc);
        if (callbackSet && callbackSet.has(callback)) {
            callbackSet.delete(callback);
            this.count--;
            log.info('sensor-log-monitor.unSubscribe: sensorDesc=' + sensorDesc);
        }
    }
    private parseSensorLog(data?: unknown) {
        log.debug('sensor-log-monitor.parseSensorLog: received message data=: ' + JSON.stringify(data));
        if (data) {
            const sensorLog = data as SensorLog; // TODO check validity
            const desc = sensorLog.desc
            const subscribers: Set<callback> | undefined = this.subscribers.get(this.sensorDesc(desc));
            if (subscribers) {
                log.debug('sensor-log-monitor.parseSensorLog:  publish message to #subscribers=' + subscribers.size);
                subscribers.forEach((publish: callback) => {
                    publish(sensorLog);
                });
            } else {
                log.debug('sensor-log-monitor.parseSensorLog: no subscribers for sensor logs');
            }
        } 
    }
}
