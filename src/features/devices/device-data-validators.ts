import {DeviceData, DeviceName, DeviceWiFiData, WiFiData, DeviceState, DeviceStatus, NetworkInterfaceInfo} from './device-data';
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
export function isDeviceDataArrayValid (raw: unknown): boolean {
    let valid = isArray(raw);
    if (!valid) {
        log.error('device-data-validators.isDeviceDataArrayValid - not an array');
    } else {
        const data = raw as Partial<Array<DeviceData>>;
        data.forEach((deviceData, index) => {
            valid = valid
            && isDeviceDataValid(deviceData);
            if (!valid) {
                log.error('device-data-validators.isDeviceDataArrayValid - not valid, index=' + index); 
            }
        })
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
        if ('color' in data) {
            valid = valid && typeof data.color === 'string';
        } else {
            data['color'] = '#00FF00AA' //TODO: Remove when all devices created with colors
        }
        if ('statusTime' in data) {
            valid = valid && typeof data.statusTime === 'number';
        }
        if ('deviceData' in data) {
            valid = valid && isValidDeviceDataLog(data.deviceData);
        }
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

function isValidDeviceDataLog(raw: unknown):boolean {
    let valid: boolean = typeof raw === 'string';
    if (!valid) {
        log.error('device-data-validators.isValidDeviceDataLog - not a string');
    } else {
        try {
            const data: Partial<DeviceStatus> = JSON.parse(raw as string);
            valid = valid
            && 'timestamp' in data && typeof data.timestamp === 'number'
            && 'hostname' in data && typeof data.hostname === 'string'
            && 'uptime' in data && typeof data.uptime === 'number'
            && 'networkInterfaces' in data && isValidNetworkInterfaces(data.networkInterfaces);
        } catch {
            log.error('device-data-validators.isValidDeviceDataLog - not parsable');
            return false;
        }
    }
    if (!valid) {
        log.error('device-data-validators.isValidDeviceDataLog - not valid');
    }
    return valid;
}
function isValidNetworkInterfaces(raw: unknown): boolean {
    let valid = typeof raw === 'object';
    if (!valid) {
        log.error('device-data-validators.isValidNetworkInterfaces - not an object');
    } else {
        const data = raw as { [ifaceName: string]: Partial<NetworkInterfaceInfo>[] };
        for (const ifaceName in data) {
            if (typeof ifaceName !== 'string')
            {
                log.error('device-data-validators.isValidNetworkInterfaces - ifaceName not a string'); 
                return false;
            }
            for (const net of data[ifaceName]) {
                valid = valid 
                && 'address' in net && typeof net.address === 'string'
                && 'netmask' in net && typeof net.internal === 'string'
                && 'family' in net && typeof net.internal === 'string'
                && 'mac' in net && typeof net.mac === 'string'
                && 'internal' in net && typeof net.mac === 'boolean';
                if (!valid) {
                    log.error('device-data-validators.isValidNetworkInterfaces - not valid network' + ifaceName);
                }
            } 
        }
    }
    return valid;
}
