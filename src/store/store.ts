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
let timerStarted = false;
export function useState(moduleName: string) {
    log.info('store.useState: reactive store in ' + moduleName);
    const state = reactive(store);
    const retrieving = ref(timerStarted);
    const counter = ref(0)
    const lastTime = ref(Date.now());
    const Count = computed(() => counter.value)
    const Age = computed(() => Date.now() - lastTime.value)

    const retrieveState = () => {
        log.info('store.useState.retrieveState');
            // Make sure we have some values from all sensors before loading locations
        const sampleCount = 2;
        state.sensors.loadSensors(sampleCount)
        .then(() => {
            lastTime.value = Date.now(); 
            counter.value++;
            state.locations.getLocations();
            state.devices.getDevices();
            state.sensors.getSensorsLast24h();
        });
    };

    const startRetrieveState = () => {
        log.info('store.useState.startRetrieveState');
        if (!retrieving.value) {
            retrieveState();
            // And then do it at regular intervals
            timer = setInterval(() => retrieveState(), 1000 * state.settings.interval);
            timerStarted = true;
        }
    };
    const stopRetrieveState = () => {
        log.info('store.useState.stopRetrieveState');
        if (retrieving.value) {
            clearInterval(timer);
            retrieving.value = false;
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
