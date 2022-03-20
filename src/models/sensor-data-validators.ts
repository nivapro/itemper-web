import { log } from '@/services/logger';
import {Attributes, Category, Descriptor, Sample, SensorData, SensorLog} from './sensor-data';

export function isSensorDataArrayValid(raw: unknown): boolean {
    let valid = Array.isArray(raw);
    if (!valid) {
        log.error('sensor-data-validators.isSensorLogValid - not an array');
    } else {
        const data = raw as SensorData[];
        data.forEach((sensorData) => valid = valid && isSensorDataValid(sensorData));
        if (!valid) {
            log.error('sensor-data-validators.isSensorDataArrayValid - not valid');
        }
    }
    return valid;
}
export function isSensorLogValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('sensor-data-validators.isSensorLogValid - not an object');
    } else {
        const data = raw as Partial<SensorLog>;
        valid = valid
        && 'desc' in data && isDescriptorValid(data.desc)
        && 'samples' in data && isSamplesValid(data.samples);
        if (!valid) {
            log.error('sensor-data-validators.isSensorLogValid - not valid');
        }
    }
    return valid;
}
export function isSensorDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('sensor-data-validators.isSensorDataValid - not an object');
    } else {
        const data = raw as Partial<SensorData>;
        valid = valid
        && '_id' in data && typeof data._id === 'string'
        && 'deviceID' in data && typeof data.deviceID === 'string'
        && 'attr' in data && isAttributesValid(data.attr)
        && 'desc' in data && isDescriptorValid(data.desc)
        && 'samples' in data && isSamplesValid(data.samples);
        if (!valid) {
            log.error('sensor-data-validators.isSensorDataValid - not valid');
        }
    }
    return valid;
}
export function isObject(raw: unknown): boolean {
    return typeof raw === 'object' && raw !== null;
}
function isCategoryValid(raw: unknown): boolean {
    let valid = typeof raw === 'string';
    if (!valid) {
        log.error('sensor-data-validators.isAttributesValid - not a string');
    } else {
        const value = raw as string;
        valid = valid && value in Category;
        if (!valid) {
            log.error('sensor-data-validators.isCategoryValid - not valid');
        }
    }
    return valid;
}
export function isAttributesValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('sensor-data-validators.isAttributesValid - not an object');
    } else {
        const attr = raw as Partial<Attributes>;
        valid = valid
        && 'accuracy' in attr && typeof attr.accuracy === 'number'
        && 'category'  in attr && isCategoryValid(attr.category)
        && 'maxSampleRate'  in attr && typeof attr.maxSampleRate === 'number'
        && 'model' in attr && typeof attr.model === 'string'
        && 'resolution' in attr && typeof attr.resolution === 'number';
        if (!valid) {
            log.error('sensor-data-validators.isAttributesValid - not valid');
        }
    }
    return valid;
}
export function isDescriptorValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('sensor-data-validators.isDescriptorValid - not an object');
    } else {
        const desc = raw as Partial<Descriptor>;
        valid = valid
        && 'SN' in desc && typeof desc.SN === 'string';
        if (!valid) {
            log.error('sensor-data-validators.isDescriptorValid - SN not valid:' + desc.SN);
        }
        valid = valid
        && 'port' in desc && typeof desc.port === 'number' && desc.port >= 0;
        if (!valid) {
            log.error('sensor-data-validators.isDescriptorValid - port not valid: ' + desc.port);
        }
    }
    return valid;
}
export function isSamplesValid(raw: unknown): boolean {
    let valid = Array.isArray(raw);
    if (!valid) {
        log.error('sensor-data-validators.isSamplesValid - not an array');
    } else {
        const data = raw as Partial<Sample[]>;
        data.forEach((sample) => {
            valid = valid && !!sample
            && 'date' in sample && typeof sample.date === 'number' && sample.date >= 0
            && 'value' in sample && typeof sample.value === 'number';
            if (!valid) {
                log.error('sensor-data-validators.isSamplesValid - not valid' + JSON.stringify(sample));
            }
        });
        if (!valid) {
            log.error('sensor-data-validators.isSamplesValid - not valid');
        }
    }
    return valid;
}
