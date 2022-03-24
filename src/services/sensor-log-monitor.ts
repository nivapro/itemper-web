import { reactive } from '@vue/composition-api';
import { log } from '@/services/logger';
import { IWebSocketService } from '@/services/websocket-service';
import { Descriptor, SensorLog } from '@/models/sensor-data';

export type Callback = (log: SensorLog) => void;


export interface CallbackObject {
    id: number;
    desc: Descriptor;
    callback: Callback;
}
export type SubscribersMap = Map<string, Set<CallbackObject>>;
export interface ISensorLogMonitor {
    subscribe (desc: Descriptor, publish: Callback): void;
    sensorDesc(desc: Descriptor): string;
}
export class SensorLogMonitor implements ISensorLogMonitor {
    private subscribers: SubscribersMap = reactive(new Map());
    private count = 0;
    private static id = 0;

    public get Subscribers(): SubscribersMap {
        return this.subscribers;
    }

    public get Count(): number{
        return this.count;
    }

    constructor(private socket: IWebSocketService) {
        socket.on('log', this.parseSensorLog.bind(this));
    }
    public sensorDesc(desc: Descriptor): string {
        return desc.SN + '/' + desc.port;
    }
    public subscribe(desc: Descriptor, callback: Callback): CallbackObject {
        const sensorDesc = this.sensorDesc(desc);
        let callbackSet: Set<CallbackObject> | undefined =  this.subscribers.get(sensorDesc);
        if (!callbackSet) {
            const callbackObject = {id: SensorLogMonitor.id++, desc, callback, };
            callbackSet = new Set();
            callbackSet.add(callbackObject);
            this.count++;
            this.subscribers.set(sensorDesc, callbackSet);
            return callbackObject;
        } else {
            const callbackObject = {id: SensorLogMonitor.id++, desc, callback};
            callbackSet.add(callbackObject);
            this.count++;
            return callbackObject;
        }
    }
    public unSubscribe(ref: CallbackObject): void {
        const sensorDesc = this.sensorDesc(ref.desc);
        const callbackSet: Set<CallbackObject> | undefined =  this.subscribers.get(sensorDesc);
        if (callbackSet) {
            callbackSet.forEach((sub) => {
                if (sub.id === ref.id) {
                    callbackSet.delete(ref);
                    if (callbackSet.size === 0) {
                        this.subscribers.delete(sensorDesc);
                    }
                    this.count--;
                }
            })
        } else {
            log.debug('sensor-log-monitor.unSubscribe: no callback Set found');
        }
    }
    private parseSensorLog(data?: unknown) {
        log.debug('sensor-log-monitor.parseSensorLog: received message data=: ' + JSON.stringify(data));
        if (data) {
            const sensorLog = data as SensorLog; // TODO check validity
            const desc = sensorLog.desc
            const subscribers: Set<CallbackObject> | undefined = this.subscribers.get(this.sensorDesc(desc));
            if (subscribers) {
                log.debug('sensor-log-monitor.parseSensorLog:  publish message to #subscribers=' + subscribers.size);
                subscribers.forEach((subscriber: CallbackObject) => {
                    subscriber.callback(sensorLog);
                });
            } else {
                log.debug('sensor-log-monitor.parseSensorLog: no subscribers for sensor logs');
            }
        } 
    }
}
