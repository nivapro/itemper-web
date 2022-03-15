<template>
    <v-simple-table v-if="sensorCount() > 0"  :style="style">
        <template v-slot:default>
            <tbody>
            <tr v-for="item in sensors" :key="item._id">
                <td class="text-left display-1" >{{ sampleValue(item) }}</td>
                <td class="text-left display-1" >{{ sampleTime(item)}}</td>
            </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';

import { Category } from '@/models/sensor-data';
import { Sensor } from '@/models/sensor';
import { Settings } from '@/store/settings';

import { log } from '@/services/logger';

import * as utils from '@/helpers';

@Component({})
export default class SensorTable extends Vue {

    @Prop() public sensors!: Sensor[];
    @Prop() public style = 'background-color: rgba(100, 100, 100, 0.1);';

    public state = Vue.$store;
    public settings: Settings = Vue.$store.settings;
    public mysensors = Vue.$store.sensors;
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
    public mounted() {
        log.debug('locationCard.mounted');

    }
    public sensorCount(): number {
        if (!this.sensors) {
            return 0;
        } else {
            return this.sensors.length;
        }
    }
    public icon(sensor: Sensor): string {
        switch (sensor.attr.category) {
            case Category.Temperature: {
                return 'fa-thermometer-half';
            }
            case Category.Humidity: {
                return 'fa-thermometer-half';
            }
            default: {
                return Category[sensor.attr.category];
            }
        }
    }
    public unit(category: Category): string {
        return this.settings.unit(category);
    }
    public unitFactor(category: Category): number {
        return this.settings.unitFactor(category);
    }
    public decimalComma(value: number): string {
        const str = value.toString();
        return this.settings.decimalComma ? str.replace('.', ',') : str;

    }
    public roundedValue(value: number, category: Category): number {
        let precision = 1;
        switch (category) {
            case Category.Temperature:
                precision = 0.5;
        }
        return this.round(value, precision);
    }
    public sampleValue(sensor: Sensor): string {
        const lastSample = sensor.samples.length;
        if (lastSample > 0) {
            const category = sensor.attr.category;
            const value = this.unitFactor(category) * sensor.samples[lastSample - 1].value;
            return this.decimalComma(this.roundedValue(value, category)) + ' ' + this.unit(category);
        } else {
            return '-';
        }
    }
    public sampleTime(sensor: Sensor ) {
        if (sensor instanceof Sensor) {
            log.debug('sensorTable: lastSample=' + JSON.stringify(sensor.samples.length));
            const lastSample = sensor.samples.length;
            if (lastSample > 0) {
                const date: number = sensor.samples[lastSample - 1].date;
                return utils.toTime(date);
            } else {
                return '-';
            }
        }
    }
    // round(2.74, 0.1) = 2.7
    // round(2.74, 0.25) = 2.75
    // round(2.74, 0.5) = 2.5
    // round(2.74, 1.0) = 3.0
    public round(value: number, precision: number) {
        const prec = precision || (precision = 1.0);
        const inverse = 1.0 / prec;
        return Math.round(value * inverse) / inverse;
    }
}
</script>

