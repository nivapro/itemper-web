<template>
    <v-card>
        <v-img v-if="location.path.length > 0" :src="location.path"></v-img>
        <v-card-title class="headline">New location</v-card-title>
        <v-card-text>
            <p>Create a NEW location.</p>
            <v-form v-model="valid" ref="location">
                <v-text-field
                    label="Enter location name"
                    prepend-icon="fa-broadcast-tower"
                    v-model="locationName"
                    :rules="nameRules"
                    required
                    clearable
                    :loading="submitted"
                ></v-text-field>
                <v-file-input
                    label="Bakgrundbild"
                    :rules="Filerules"
                    accept="image/png, image/jpeg"
                    show-size counter chips
                    v-model="locationImage"
                    prepend-icon="fa-image"
                ></v-file-input>
                <v-color-picker
                    v-model="color"
                    hide-canvas
                    hide-inputs
                    hide-mode-switch
                    show-swatches
                    :swatches="swatches" 
                    class="mx-auto"
                ></v-color-picker>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <p v-if="error()"  class="red--text" align="center">{{errorMsg}}</p>
            <p v-else></p>
            <v-spacer></v-spacer>
            <v-btn text color="orange" :disabled="!valid" :loading="submitted"  @click="submit">Save</v-btn>
            <v-btn text  @click="close">Close</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script lang="ts">


import {Vue, Component} from 'vue-property-decorator';

// Models
// import * as locations from '@/models/locations'


import { log } from '@/services/logger';
import {json } from '@/helpers';

import { Location } from '@/features/locations';

type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FileValidationFunction = (value: any) => BooleanOrString;
@Component({})
export default class NewLocationCard extends Vue {

    public settings = Vue.$store.settings;
    public locationName = '';
    public locationKey = '';
    public locationImage: File = new File([''], '', {type: 'text/plain'});
    public location: Location = new Location('', '#e39900' );
    public color = '#e39900';
    public swatches =  [
        ['#e39900', '#990ae3', '#990000'],
        ['#0a99e3', '#000a99', '#00e31e'],
        ['#00FF00', '#00AA00', '#005500'],
        ['#00FFFF', '#00AAAA', '#005555'],
        ['#0000FF', '#0000AA', '#000055'],
      ];
    public valid =  false;
    public submitted = false;
    public errorMsg = '';
    public timeout = 5_000;
    public nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^[a-öA-Ö0-9]+$/.test(v) && v.length >= 4  && v.length <= 32 || 'Must be 4-32 characters, no white spaces or special characters allowed',
        ];
    public Filerules: FileValidationFunction[] = [
        (v) => !v || v.size < 2_000_000 || 'File size should be less than 2 MB!',
      ];
    public red = '';
    public green = '';
    public blue = '';
    public store = Vue.$store;
    public locations = Vue.$store.locations;
    public data() {
        return {
            locationImage: null,
        };
    }
    public image(): string {
            return '/img/' + 'uterum' + '.jpg';
    }
    public rgba() {
      return `RGBA(${this.red},${this.green},${this.blue},0.7)`;
    }
    public background() {
      return `background: ${this.rgba}`;
    }
    public submit() {
        if (!this.valid) {
            this.displayError('Locations form not valid');
            return;
        } else {
            log.debug('new-location-card.Image file' + json(this.locationImage));
            this.createLocation();
        }
    }
    public close() {
        log.debug('new-location-card.close');
        this.submitted = false;
        this.locationName = '';
        this.$emit('close');
    }
    public error(): boolean {
        return this.errorMsg !== '';
    }
    private createLocation() {
        log.debug('new-location-card.createLocation');
        const form = new FormData();
        form.append('name', this.locationName);
        form.append('color', this.color);
        form.append('locationImage', this.locationImage);
        this.submitted = true;
        this.locations.createLocation(form)
        .then((location) => {
            this.location = location;
            this.close();
        })
        .catch((err) => {
            this.submitted = false;
            this.displayError('error (' + err.status + '): ' + err.message);
        });
    }
    private reset(): void {
        this.errorMsg = '';
    }
    private displayError(msg: string) {
        this.errorMsg = msg;
        this.setTimer();
    }
    private setTimer() {
        const timeout = 5_250;
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
