<template>
<div>
    <v-card :color="location.color">
            <v-img  class="d-flex align-center white-text" :src="locationImage()"  :height="height" >
                    <v-fade-transition>
                            <v-container>
                                <v-row>
                                    <v-col class="d-flex justify-center">
                                        <v-card light v-show="editSensors">
                                            <v-card-text transition="slide-y-transition">
                                            <v-list style="max-height: 300px" class="overflow-y-auto">
                                            <v-list-item-group 
                                                v-model="seletedSensors"
                                                max="20"
                                                multiple
                                            >
                                                <template v-for="(sensor, i) in availableSensors">
                                                <v-list-item
                                                    :key="`sensor-${i}`"
                                                    :value="sensor"
                                                    active-class="deep-purple--text text--accent-4"
                                                >
                                                    <v-list-item-content>
                                                        <v-list-item-title >{{sensorName(sensor)}}</v-list-item-title>
                                                    </v-list-item-content>

                                                    <v-list-item-action>
                                                        <v-checkbox
                                                        :input-value="isSelected(sensor)"
                                                        :true-value="seletedSensors"
                                                        color="deep-purple accent-4"
                                                        @click="toggleSensor(sensor)"
                                                        ></v-checkbox>
                                                    </v-list-item-action>
                                                </v-list-item>
                                                </template>
                                            </v-list-item-group>
                                            </v-list>
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-btn class="ma-2" color="blue" text @click.native="submitSensors()">
                                                    Spara
                                                </v-btn>
                                                <v-btn class="ma-2" color="orange" text @click.native="cancelEditSensors()">
                                                    Avbryt
                                                </v-btn>                               
                                            </v-card-actions>
                                        </v-card>
                                        <v-card light v-show="editFile">
                                            <v-card-text>
                                                <v-form v-model="fileFormValid" ref="locations">
                                                    <v-file-input
                                                        label="Bakgrundbild"
                                                        :rules="Filerules"
                                                        accept="image/png, image/jpeg"
                                                        show-size
                                                        counter chips
                                                        v-model="newImage"
                                                        prepend-icon="fa-file-image"
                                                    ></v-file-input>
                                                </v-form>
                                            </v-card-text>

                                            <v-card-actions>
                                                <v-btn class="ma-2" :disabled="!fileFormValid || !this.newImage" color="blue" text @click.native="submitFile()">
                                                    Spara
                                                </v-btn>
                                                <v-btn class="ma-2" color="orange" text @click.native="cancelEditFile()">
                                                    Avbryt
                                                </v-btn>                               
                                            </v-card-actions>
                                        </v-card>
                                        <v-card light v-show="editColor">
                                            <v-card-text>
                                                <v-color-picker
                                                        v-model="location.color"
                                                        hide-canvas
                                                        hide-inputs
                                                        hide-mode-switch
                                                        show-swatches
                                                        light
                                                        :swatches="swatches" 
                                                        class="mx-auto"
                                                        :disabled="submitted"
                                                >
                                                </v-color-picker>
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-btn :disabled="submitted" class="ma-2" color="blue" text @click.native="submitColor()">
                                                    Spara
                                                </v-btn>
                                                <v-btn class="ma-2" color="orange" text @click.native="cancelEditColor()">
                                                    Avbryt
                                                </v-btn>
                                            </v-card-actions>
                                        </v-card>
                                        <div v-show="showConfiguration && !editFile && !editColor && !editSensors" :style="overlay()">
                                            <v-btn  class="white--text"  icon @click.native="onEditSensors()">
                                                <v-icon x-large>fa-biohazard</v-icon>
                                            </v-btn>
                                            <v-btn  class="white--text"  icon @click.native="onEditFile()">
                                                <v-icon x-large>fa-file-image</v-icon>
                                            </v-btn>
                                            <v-btn class="white--text"  icon @click.native="onEditColor()">
                                                <v-icon x-large>fa-fill</v-icon>
                                            </v-btn>
                                        </div>
                                        <SensorTable v-show="!editSensors" :sensors="location.sensors"></SensorTable>
                                    </v-col>
                                </v-row>
                            </v-container>
                    </v-fade-transition>
            </v-img>

        <v-card-title primary-title class="white--text" :style="overlay()">
            <div>
                <div v-if="!showConfiguration" class="headline">{{ location.name }}</div>
                <v-text-field v-else-if="!editName"  class="headline white--text"
                            prepend-inner-icon="fa-edit"
                            v-model="locationName"
                            :rules="nameRules"
                            dense
                            required
                            @focus="onEditName()"
                ></v-text-field>                
                <v-text-field v-else  class="headline white--text"
                            prepend-inner-icon="fa-edit"
                            v-model="locationName"
                            :rules="nameRules"
                            dense
                            required
                            :loading="submitted"
                            append-icon="fa-check"
                            append-outer-icon="fa-times"
                            @click:append="submitName()"
                            @click:append-outer="cancelEditName()"
                ></v-text-field>
            </div>
        </v-card-title>
        <v-card-actions v-if="showConfiguration">
                <v-btn text :disabled="showConfiguration && (submitted || editSensors || editColor || editFile)" class="white--text" @click.native="toggleConfiguration()">Stäng</v-btn>
                <v-spacer></v-spacer>
                <v-btn text :disabled="showConfiguration && (submitted || editSensors || editColor || editFile)" class="white--text" @click.native="deleteLocation()">Radera</v-btn>
        </v-card-actions>
        <v-card-actions v-else>
            <div>
                <v-btn text :disabled="showConfiguration && (submitted || editSensors || editColor || editFile)" class="white--text"  @click.native="toggleConfiguration()">Ändra</v-btn>
            </div>
        </v-card-actions>
    </v-card>
</div>
</template>

<script lang="ts">
import { iTemperAPI } from '@/config';
import hexToRgba from 'hex-to-rgba';

import {Vue, Component, Prop} from 'vue-property-decorator';

// Models
// import * as locations from '@/models/locations'
import { Descriptor } from '@/models/sensor-data';
import { Sensor } from '@/models/sensor';
import { Location, Locations } from '@/features/locations';
import { Settings } from '@/store/settings';
import { Sensors } from '@/store/sensors';

// import * as messages from '@/models/messages';
// Services

import { log } from '@/services/logger';
import {json } from '@/helpers';

import SensorTable from './location-sensor-table.vue';
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;
interface FileProperties {
    name: string;
    size: number;
    type: string;
}
type FileValidationFunction = (value: FileProperties) => BooleanOrString;
@Component({
    components: { SensorTable },
})
export default class LocationCard extends Vue {

    @Prop() public location!: Location;
    @Prop() public id!: number;
    @Prop() public height!: number;

    public items: string[] =  [];
    public seletedSensors: Sensor[] = [];
    public availableSensors: Sensor[] = [];
    public sensorDesc: Descriptor[] = [];

    public nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^[a-öA-Ö0-9]+$/.test(v) && v.length >= 4 && v.length <= 32 || 'Must be 4-32 characters, no white spaces or special characters allowed',
        ];
    public Filerules: FileValidationFunction[] = [
        (v) => !v || v.size < 2_000_000 || 'File size should be less than 2 MB!',
      ];
    public swatches =  [
        ['#e39900', '#990ae3', '#990000'],
        ['#0a99e3', '#000a99', '#00e31e'],
        ['#00FF00', '#00AA00', '#005500'],
        ['#00FFFF', '#00AAAA', '#005555'],
        ['#0000FF', '#0000AA', '#000055'],
      ];
    public state = Vue.$store;
    public settings: Settings = Vue.$store.settings;
    public sensors: Sensors = Vue.$store.sensors;
    public locations: Locations =  Vue.$store.locations;

    public showConfiguration= false;
    public editName = false;
    public editColor = false;
    public editFile = false;
    public fileFormValid = false;
    public editSensors = false;

    public locationName = '';
    public locationColor = '';
    public newImage: File = new File([''], 'current');

    public submitted = false;
    public errorMsg = '';
    public timeout = 2_000;

    public toggleConfiguration() {
        this.showConfiguration = !this.showConfiguration;
        if (this.showConfiguration) {
            this.locationColor = this.location.color.slice();
            this.locationName = this.location.name.slice();
        }
    }
    public fileSize(): number {
        return (this.newImage === undefined || this.newImage.size === undefined) ? 0 : this.newImage.size;
    }
    public locationImage(): string {
        const path = iTemperAPI + this.location.path;
        return path;
    }
    public sensorNames() {
        for (const sensor of this.sensors.all) {
            if (!this.items.find((i) => i === sensor.name)) {
            this.items.push(sensor.name);
            }
        }
    }
    // public locationSensors() {
    //     for (const sensor of this.location.sensors) {
    //         if (!this.seletedSensors.find((i) => i.name === sensor.name)) {
    //         // this.value.push(sensor.name);
    //         }
    //     }
    // }
    public isSelected(sensor: Sensor) {
        return this.seletedSensors.find((s) => s.desc === sensor.desc);
    }
    // public updateLocationSensors(e: any) {
    //     log.debug('locationCard.updateLocationSensors ' + JSON.stringify(e));
    //     this.locationSensors();
    // }
    public onEditName() {
        this.editName = true;
        this.locationName = this.location.name.slice();
    }
    public onEditSensors() {
        this.availableSensors = [];
        this.seletedSensors = [];
        this.sensors.all.forEach((sensor) => {
            if (sensor.locationId === this.location._id) {
                this.seletedSensors.push(sensor);
                this.availableSensors.push(sensor);
            } else if (sensor.locationId === '') {
                this.availableSensors.push(sensor);
            }
        });
        this.editSensors = true;
    }
    public cancelEditSensors() {
            this.editSensors = false;
    }
    public submitSensors() {
        log.debug('location-card.submitSensors: update sensors='  + JSON.stringify(this.seletedSensors));
        this.submitted = true;
        this.locations.updateSensors(this.seletedSensors, this.location)
        .then(() => {
            this.submitted = false;
            this.editSensors = false;
        })
        .catch((err) => {
            this.submitted = false;
            this.displayError('error (' + err.status + '): ' + err.message);
        });
    }
    public onEditFile() {
        this.editFile = true;
    }
    public cancelEditFile() {
        this.editFile = false;
    }
    public submitFile() {
        if (!this.fileFormValid) {
            this.displayError('File form not valid');
            return;
        } else {
            log.debug('location-card.submitFile: Save file ' + json(this.newImage));
            const form = new FormData();
            form.append('locationImage', this.newImage);
            this.submitted = true;
            this.locations.updateFile(form, this.location)
            .then((location) => {
                this.submitted = false;
                this.editFile = false;
                this.location.path = location.path;
                this.newImage = new File([''], 'current');
            })
            .catch((err) => {
                this.submitted = false;
                this.displayError('error (' + err.status + '): ' + err.message);
            });
        }
    }
    public cancelEditName() {
            this.locationName = this.location.name.slice();
            this.editName = false;
    }
    public submitName() {
        if (this.location.name === this.locationName) {
            log.debug('location-card.submitName: no changes');
            return;
        } else {
            log.debug('location-card.submitName: update location name');
            this.submitted = true;
            this.locations.updateName(this.locationName, this.location)
            .then((received) => {
                this.location.name = received.name;
                this.submitted = false;
                this.editName = false;
            })
            .catch((err) => {
                this.submitted = false;
                this.displayError('error (' + err.status + '): ' + err.message);
            });
        }
    }
    public submitColor() {
        if (this.location.color === this.locationColor) {
            log.debug('location-card.submitColor: no changes');
            return;
        } else {
            log.debug('location-card.submitColor: update overlay color');
            this.submitted = true;
            this.locations.updateColor(this.location.color, this.location)
            .then(() => {
                this.submitted = false;
                this.editColor = false;
            })
            .catch((err) => {
                this.submitted = false;
                this.displayError('error (' + err.status + '): ' + err.message);
            });
            }
    }
    public onEditColor() {
        this.editColor = true;
        this.locationColor = this.location.color.slice();
    }
    public cancelEditColor() {
            this.editColor = false;
            this.location.color = this.locationColor.slice();
    }
    public deleteLocation() {
            this.locations.deleteLocation(this.location)
            .then(() => {
                this.submitted = false;
            })
            .catch((err) => {
                this.submitted = false;
                this.displayError('error (' + err.status + '): ' + err.message);
            });
    }
     public toggleSensor(sensor: Sensor) {
         const index = this.seletedSensors.indexOf(sensor);
         if (index >= 0) {
             // remove
             this.seletedSensors.splice(index, 1);
         } else {
             // add
             this.seletedSensors.push(sensor);
         }
    }
    public overlay() {
        return 'background-color: ' + hexToRgba(this.location.color, 0.4);
    }
    public mounted() {
        log.debug('location-card.mounted');
    }

    public toggleMonitor() {
        this.showConfiguration = false;
       // this.showMonitor = !this.showMonitor;
    }

    public sensorName(sensor: Sensor) {
        return sensor.attr.category + ' | ' + sensor.desc.SN + ' | port: ' + sensor.desc.port;
    }
    public error(): boolean {
        return this.errorMsg !== '';
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
