import { Itemper } from '@/services/itemper';
import { Admin } from '@/store/admin';
import { Devices} from '@/store/devices';
import { Locations } from '@/features/locations';
import { Notice } from '@/store/notice';
import { Sensors } from '@/store/sensors';
import { Settings } from '@/store/settings';
import { User } from '@/store/user';

import { Vue } from 'vue-property-decorator';
import { computed, reactive, ref } from '@vue/composition-api';
import { log } from '@/services/logger';


export interface IStore {
    itemper: Itemper;
    admin: Admin;
    devices: Devices;
    locations: Locations;
    notice: Notice;
    sensors: Sensors;
    settings: Settings;
    user: User;
}
export class Store implements IStore {
    public itemper: Itemper = new Itemper();
    public admin: Admin = new Admin(this.itemper.adminService);
    public devices: Devices = new Devices(this.itemper.deviceService);
    public locations: Locations  = new Locations(this.itemper.locationService);
    public notice: Notice = new Notice();
    public sensors: Sensors = new Sensors(this.itemper.sensorService);
    public settings: Settings = new Settings();
    public user: User  = new User(this.itemper.apiService);
}
export const store: Store = new Store();

export function init() {
    Vue.$store = store;
}
let timer: NodeJS.Timer;
// eslint-disable-next-line prefer-const
let timerStarted = false;
// eslint-disable-next-line prefer-const
let count = 0;
// eslint-disable-next-line prefer-const
let time = Date.now();
export function useState(moduleName: string) {
    log.info('store.useState: reactive store in ' + moduleName);
    const state = reactive(store);
    const retrieving = ref(timerStarted);
    const counter = ref(count);
    const lastTime = ref(time);
    const Count = computed(() => counter.value)
    const Age = computed(() => Date.now() - lastTime.value)

    const reset = () => {
        counter.value = 0;
        lastTime.value = Date.now();
        retrieving.value = false;
    }
    const updateState = async () => {
        log.info('store.useState.updateState');
        const ms = 1000;
        const period = counter.value === 0
            ? 24 * 60 * 60 * ms
            : state.settings.interval * ms;
        lastTime.value = Date.now(); 
        await state.locations.getLocations();
        await state.devices.getDevices();
        await state.sensors.getSensorsLast(period);
        counter.value++;
    };

    const startRetrieveState = async () => {
        log.info('store.useState.startRetrieveState');

        if (!retrieving.value) {
            // Make sure we have some values from all sensors before loading locations 
            // (and devices)
            lastTime.value = Date.now(); 
            const sampleCount = 2;
            await state.sensors.loadSensors(sampleCount)
            await state.locations.getLocations();
            await state.devices.getDevices();
            await state.sensors.getSensorsLast24h();
            // And then do it at regular intervals
            const ms = 1000;
            timer = setInterval(() => updateState(), state.settings.interval * ms);
            counter.value++;
            retrieving.value = true;
        }
    };
    const stopRetrieveState = () => {
        log.info('store.useState.stopRetrieveState');
        if (retrieving.value) {
            clearInterval(timer);
            reset();
        }
    };

    const resetState = () => {
        state.admin.reset();
        state.devices.reset();
        state.locations.reset();
        state.sensors.reset();
        state.user.reset();
    };

    return { Age, Count, state, startRetrieveState, stopRetrieveState, resetState, retrieving };
}
export function reset() {
    Vue.$store.admin.reset();
    Vue.$store.devices.reset();
    Vue.$store.locations.reset();
    Vue.$store.sensors.reset();
    Vue.$store.user.reset();
}
