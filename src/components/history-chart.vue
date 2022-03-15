<template>
<div>
    <highcharts :options="options()"></highcharts>
</div>
</template>

<script lang="ts">

import VueHighcharts from 'vue-highcharts';
Vue.use(VueHighcharts);
import * as moment from 'moment-timezone';


import {Vue, Component, Prop} from 'vue-property-decorator';



// Models
// import * as locations from '@/models/locations'
import { Sample, Category } from '@/models/sensor-data';
import { Sensor } from '@/models/sensor';

import { Settings } from '@/store/settings';

import { log } from '@/services/logger';

import KalmanFilter from 'kalmanjs';

@Component({})
export default class HistoryChart extends Vue {
    @Prop() public title!: string;
    @Prop() public sensor!: Sensor;
    public firstSampleDate: number = Date.now() - 24 * 60 * 60 * 1000;

    public state = Vue.$store;
    public settings: Settings = Vue.$store.settings;

   // log.debug('locationCard sensor=' + JSON.stringify());

    public showHistory = false;
    public showMonitor = false;


    public mounted() {
        log.debug('historyChart.mounted');

    }
    public toggleHistory() {
        this.showHistory = !this.showHistory;
        this.showMonitor = false;
    }

    public options(): any {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return {
            chart: {
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                type: 'spline',
            },
            title: {
                text: 'Senaste 24 timmar',
                x: -20, // center
            },
            subtitle: {
                text: 'Givare: ' + this.SN() + '/' + this.port(),
                x: -20,
            },
            xAxis: {
                type: 'datetime',
            },
            yAxis: {
                title: {
                text: 'Temperatur (°C)',
                },
                plotLines: [{
                value: 0,
                width: 0,
                color: '#808080',
                }],
            },
            legend: {
                enabled: false,
            },
            credits: {
                enabled: false,
            },
            tooltip: {
                valueSuffix: '°C',
            },

            series: [{
                name: this.title,
                data: this.getData(),
            }],
            time: {
                getTimezoneOffset(timestamp: number): number {
                    const zone = self.settings.zone;
                    const timezoneOffset = -moment.tz(timestamp, zone).utcOffset();
                    return timezoneOffset;
                },
            },
        };
    }
    public getData(): number[][] {
        const oneHour = 60 * 60 * 1000;
        const firstSampleDate =  Date.now() - 24 * oneHour;
        const data: number [][] = [];
        const kalmanFilter = new KalmanFilter({R: 0.01, Q: 0.5});

        if (this.sensor) {
            this.sensor.samples
                .filter((sample) => sample.date > firstSampleDate)
                .map((sample) =>
                    data.push([sample.date, this.round(kalmanFilter.filter(sample.value), 0.01)]));
        }
        return data;
    }
    public unitSymbol(): string {
        return this.settings.unit(Category.Temperature);
    }
    public limit(): number {
        return this.settings.limit;
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
    public isValueValid(): boolean {
        return this.sensor && this.sensor.samples.length > 0;
    }
    public lastSample(): Sample {
        const last = this.sensor.samples.length - 1;
        const data = this.sensor.samples[last];
        return data;
    }
    public firstSample(id: number): Sample {
        return this.sensor.samples[0];
    }

    public count(): number {
        if (this.isValueValid()) {
            return  this.sensor.samples.length;
        } else {
            return 0;
        }
    }
    public value(): string {
        if (!this.isValueValid()) {
            return '';
        }
        const multiplier = Math.pow(10, this.settings.resolution || 0);
        const value = this.lastSample().value;
        return this.round(value, 0.5).toString().replace('.', ',');
        // Math.round( value * multiplier) / multiplier;
    }
    public period(): string {
        if (!this.isValueValid()) {
            return '';
        }
        const last = new Date(this.lastSample().date);
        return last.toLocaleDateString();
    }
    public SN(): string {
        if (this.sensor !== undefined) {
            return this.sensor.desc.SN;
        } else {
            return '?';
        }
    }
    public port(): number {
        if (this.sensor !== undefined) {
            return this.sensor.desc.port;
        } else {
            return -1;
        }
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

