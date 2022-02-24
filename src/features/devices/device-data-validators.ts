import {DeviceData, DeviceName, DeviceWiFiData, WiFiData, DeviceState} from './device-data';
import { isObject, isSensorDataArrayValid } from '@/models/sensor-data-validators';
import { log } from '@/services/logger';
import { isArray } from 'util';
export function isDeviceNameValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-data-validators.isDeviceNameValid - not an object');
    } else {
        const data = raw as Partial<DeviceName>;
        valid = valid
        && 'name' in data && typeof data.name === 'string';
        if (!valid) {
            log.error('device-data-validators.isDeviceNameValid - not valid');
        }
    }
    return valid;
}
export function isDeviceColorValid(raw: unknown): boolean {
    const m = 'device-data-validators.isDeviceColorValid - ';
    let valid = isObject(raw);
    if (!valid) {
        log.error(m + 'not an object');
    } else {
        const data = raw as Partial<{color: string}>;
        valid = valid
        && 'color' in data && typeof data.color === 'string'
        if (!valid) {
            log.error(m + 'not valid');
        }
    }
    return valid;
}
export function isDeviceKeyValid(raw: unknown): boolean {
    const m = 'device-data-validators.isDeviceKeyValid - ';
    let valid = isObject(raw);
    if (!valid) {
        log.error(m + 'not an object');
    } else {
        const data = raw as Partial<{key: string}>;
        valid = valid
        && 'key' in data && typeof data.key === 'string'
        if (!valid) {
            log.error(m + 'not valid');
        }
    }
    return valid;
}
export function isDeviceDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-data-validators.isDeviceDataValid - not an object');
    } else {
        const data = raw as Partial<DeviceData>;
        valid = valid
        && 'deviceID' in data && typeof data.deviceID === 'string'
        && 'name' in data && typeof data.name === 'string'
        && 'key' in data && typeof data.key === 'string';
        if (!valid) {
            log.error('device-data-validators.isDeviceDataValid - not valid');
        }
    }
    return valid;
}
export function isWiFiDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-data-validators.isWiFiDataValid - not an object');
    } else {
        const data = raw as Partial<WiFiData>;
        valid = valid
        && 'ssid' in data && typeof data.ssid === 'string'
        && 'security' in data && typeof data.security === 'string'
        && 'quality' in data && typeof data.quality === 'number'
        && 'channel' in data && typeof data.channel === 'number';
        if (!valid) {
            log.error('device-data-validators.isWiFiDataValid - not valid');
        }
    }
    return valid;
}
export function isWiFiDataArrayValid(raw: unknown): boolean {
    let valid = isArray(raw);
    if (!valid) {
        log.error('device-data-validators.isWiFiDataArrayValid - not an array');
    } else {
        const data = raw as Partial<WiFiData[]>;
        data.forEach((network) => {
            valid = valid && isWiFiDataValid(network);
        });
        if (!valid) {
            log.error('device-data-validators.isWiFiDataArrayValid - not valid');
        }
    }
    return valid;
}
export function isDeviceWiFiDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-data-validators.isDeviceWiFiDataValid - not an object');
    } else {
        const data = raw as Partial<DeviceWiFiData>;
        if ('current' in data) {
            valid = valid && isWiFiDataValid(data.current);
        }
        valid = valid
        && 'available' in data && Array.isArray(data.available);
        if (valid) {
            data.available?.forEach((network) => valid = valid && isWiFiDataValid(network));
        }
        if (!valid) {
            log.error('device-data-validators.isDeviceWiFiDataValid - not valid');
        }
    }
    return valid;
}
export function isDeviceStateValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-data-validators.isDeviceStateValid - not an object');
    } else {
        const data = raw as Partial<DeviceState>;
        if ('deviceData' in data) {
            valid = valid && isDeviceDataValid(data.deviceData);
        }
        valid = valid
        && 'networks' in data && isDeviceWiFiDataValid(data.networks)
        && 'sensors' in data && isSensorDataArrayValid(data.sensors);
        if (!valid) {
            log.error('device-data-validators.isDeviceStateValid - not valid');
        }
    }
    return valid;
}
