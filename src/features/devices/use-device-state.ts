import { ref, reactive, UnwrapRef } from '@vue/composition-api';
import { SensorData } from '@/models/sensor-data';
import { DeviceData, WiFiNetwork } from './device-data';
import { Device } from './device';
class UseDeviceState {
    public networks: UnwrapRef<{current: UnwrapRef<WiFiNetwork>, available: Array<UnwrapRef<WiFiNetwork>>}>;

    constructor(    public deviceData: UnwrapRef<DeviceData>,
                    current: UnwrapRef<WiFiNetwork>,
                    available: Array<UnwrapRef<WiFiNetwork>>,
                    public sensors: Array<UnwrapRef<SensorData>>) {
            this.networks = {current, available};
    }
    public addNetwork = (network: WiFiNetwork) => {
        deviceState.networks.available.push(reactive(network));

    }
    public getNetwork = () => {
        return deviceState.networks.available[1];
    }
}

let deviceState: UseDeviceState;

let device: Device;

export function useDeviceState() {
    const resetDeviceState = () => {
        deviceState = new UseDeviceState(
            reactive({name: ref(''), color: ref(''), key: ref(''), deviceID: ref('')}),
            reactive({ssid: ref(''), security: ref(''), quality: ref(0), channel: ref(0)}),
            [], []);
    };
    if (!deviceState) {
        resetDeviceState();
    }

    function setDevice (dev: Device) {
        device = dev;
    }
    function getDevice(): Device {
        if (device) {
            return device; 
        } else {
            throw Error('useDeviceState.getDevice, device=undefined');
        }
    }

    return { deviceState: reactive(deviceState), resetDeviceState, setDevice, getDevice };
}
