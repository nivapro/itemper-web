import { reactive } from '@vue/composition-api';
import { SensorData } from '@/models/sensor-data';
import { DeviceData, WiFiNetwork } from './device-data';

class DeviceState {
    public deviceData: DeviceData = { name: '', color: '', key: '', deviceID: ''};
    public networks: {current: WiFiNetwork, available: Array<WiFiNetwork>} = {current: {ssid: '', security: '', quality: 0, channel: 0}, available: []};
    public sensors: Array<SensorData> = [];
}
const deviceState =  reactive(new DeviceState());

export function useDeviceState() {

    const resetDeviceState = () => {
        deviceState.deviceData = { name: '', color: '', key: '', deviceID: '' };
        deviceState.networks = { current: {ssid: '', security: '', quality: 0, channel: 0}, available: [] };
        deviceState.sensors = [];
    };
    // const addNetwork = (network: WiFiNetwork) => {
    //     deviceState.networks.available.push(network)
    // }
    // const getNetwork = () => {
    //     return deviceState.networks.available[1];
    // }

    return { deviceState, resetDeviceState };
}
