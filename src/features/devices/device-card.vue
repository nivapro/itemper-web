<template>
    <v-card>
        <v-container fill-height fluid :class="color()">
            <v-layout fill-height>
                <v-flex  align-end flexbox>
                    <span  v-if="!showConfiguration" class="display-1">{{ name() }} </span>
                    <v-text-field v-else-if="!editName"  class="display-1"
                                prepend-inner-icon="fa-edit"
                                v-model="newName"
                                :rules="nameRules"
                                dense
                                required
                                @focus="onEditName()"
                    ></v-text-field>                
                    <v-text-field v-else  class="display-1"
                                prepend-inner-icon="fa-edit"
                                v-model="newName"
                                :rules="nameRules"
                                dense
                                required
                                :loading="submitted"
                                append-icon="fa-check"
                                append-outer-icon="fa-times"
                                @click:append="submitName()"
                                @click:append-outer="cancelEditName()"
                    ></v-text-field>
                </v-flex>
            </v-layout>
        </v-container>
          <v-simple-table>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-left">Givare</th>
                    <th class="text-left">Modell</th>
                    <th class="text-left">Kategori</th>
                    <th class="text-left">Plats</th>
                    <th class="text-left">Senaste mätvärde</th>
                    <th class="text-left">Tidpunkt</th>
                    <th class="text-left">Nogrannhet, decimaler</th>
                    <th class="text-left">Max samplingsfrekv. (Hz)</th>
                    <th class="text-left">Antal mätvärden</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item,id) in state.sensors.filterByDeviceID(device.deviceID)" :key="id" >
                    <td>{{ item.desc.SN + '/' +  item.desc.port }}</td>
                    <td>{{ item.attr.model }}</td>
                    <td>{{ item.attr.category }}</td>
                    <td>{{ locationName(item) }}</td>
                    <td>
                        <span v-if="item.samples.length > 0">{{ item.samples[item.samples.length-1].value }}</span>
                        <span v-else>-</span>
                    </td>
                    <td>
                        <span v-if="item.samples.length > 0">{{ time(item.samples[item.samples.length-1].date) }}</span>
                        <span v-else>-</span>
                    </td>
                    <td>{{ item.attr.accuracy }}</td>
                    <td>{{ item.attr.maxSampleRate }}</td>
                    <td>{{ item.samples.length }}</td>
                </tr>
                </tbody>
            </template>
            </v-simple-table>
            <div v-if="device.key !== ''">
                <p>
                    <span   class="d-inline-block text-truncate" 
                            style="max-width: 400px;">
                    <v-btn text icon @click="copy()">
                        <v-icon >fa-clone</v-icon>
                    </v-btn>
                    <span :id="htmlID()">{{ device.key }}</span>
                    </span>

                </p>
            </div>
        <v-card-actions v-if="showConfiguration">
                <v-btn text :disabled="showConfiguration && (submitted || editName)" color="orange" @click.native="toggleConfiguration()">Stäng</v-btn>
                <v-spacer></v-spacer>
                <v-btn text :disabled="showConfiguration && (submitted || editName)" color="orange" @click.native="deleteDevice()">Radera</v-btn>
        </v-card-actions>
        <v-card-actions v-else>
            <div>
                <v-btn text :disabled="showConfiguration && (submitted || editName)" color="orange" @click.native="toggleConfiguration()">Ändra</v-btn>
            </div>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">

import {Vue, Component, Prop} from 'vue-property-decorator';

// Models

import { Device } from '@/features/devices';
import { Sensor } from '@/models/sensor';

import {  copyToClipboard} from '@/helpers';

import { log } from '@/services/logger';

type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;
@Component({})
export default class DeviceCard extends Vue {
    @Prop() public device!: Device;
    @Prop() public id!: number;

    public state = Vue.$store;
    public sensors = Vue.$store.sensors;
    public devices = Vue.$store.devices;
    public locations = Vue.$store.locations;
    public showConfiguration = false;
    public newName = '';
    public editName = false;
    public submitted = false;
    public errorMsg = '';

    public nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^[a-zA-Z0-9\-_]+$/.test(v) && v.length >= 4 || 'Must be at least 4 characters a-z, A-Z, 0-9, - or _, no white spaces or other special characters allowed',
        ];
    public headers = [
        {
        text: 'Givare',
        align: 'left',
        sortable: false,
        value: 'name',
        },
        { text: 'Typ', value: 'category' },
        { text: 'Mätvärde', value: 'lastValue' },
        { text: 'Sensast', value: 'lastTime' },
    ];

    public htmlID() {
        return this.device.name + this.id;
    }
    public toggleConfiguration() {
        this.showConfiguration = !this.showConfiguration;
        if (this.showConfiguration) {
            this.newName = this.device.name.slice();
        }
    }
    public locationName(sensor: Sensor): string {
        const location = this.locations.locationOf(sensor.locationId);
        return location ? location.name : '-';
    }
    public filterSensors(sensors: Sensor[], deviceID: string): Sensor[] {
        return this.sensors.filterByDeviceID(deviceID);
    }
    public color(): string {
        const id = this.device.colorID;
        return 'overlay-' + id.toString();
    }
    public time(date: number): string {
        return new Date(date).toLocaleTimeString();
    }
    public name(): string {
        return this.device.name;
    }
    public onEditName() {
        this.editName = true;
    }
    public cancelEditName() {
            this.newName = this.device.name.slice();
            this.editName = false;
    }
    public submitName(): void {
        this.state.devices.renameDevice(this.newName, this.device);
        if (this.device.name === this.newName) {
            log.debug('deviceCard.submitName: no changes');
            return;
        } else {
            log.debug('deviceCard.submitName: update device name');
            this.submitted = true;
            this.devices.renameDevice(this.newName, this.device)
            .then((received) => {
                this.device.name = received.name;
                this.submitted = false;
                this.editName = false;
            })
            .catch((err) => {
                this.submitted = false;
                this.displayError('error (' + err.status + '): ' + err.message + ', ' + JSON.stringify(err));
            });
        }
    }

    public deleteDevice() {
        this.state.devices.deleteDevice(this.device);
    }
    public error(): boolean {
        return this.errorMsg !== '';
    }
    private copy() {
        if (!copyToClipboard(this.htmlID())) {
                this.displayError('Error: Cannot copy key to clipboard');
        }
    }
    private reset(): void {
        this.errorMsg = '';
    }
    private displayError(msg: string) {
        this.errorMsg = msg;
        this.setTimer();
    }
    private setTimer() {
        const timeout = 2_250;
        setTimeout(() => {this.reset(); }, timeout);
    }
}

</script>

<style scoped>

.overlay-0 {
    background-color: rgba(227, 153, 0, 0.7);
}

.overlay-1 {
    background-color: rgba(153, 10, 227, 0.7);
}

.overlay-2 {
    background-color: rgba(153, 0, 0, 0.7);
}

.overlay-3 {
    background-color: rgba(10, 153, 227, 0.7);
}

.overlay-4 {
    background-color: rgba(0, 10, 153, 0.7);
}

.overlay-5 {
    background-color: rgba(0, 227, 30, 0.7);
}

.highcharts-background {
    background-color: rgba(255, 255, 255, 0.1);
}

</style>
