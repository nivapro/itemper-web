<template>
<div>
    <highcharts :options="options"></highcharts>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from '@vue/composition-api';
import { Chart } from 'highcharts-vue';
import KalmanFilter from 'kalmanjs';
import * as moment from 'moment-timezone';

import { Sensor } from '@/models/sensor';
import { useState } from '@/store/store';

export default defineComponent({
  name: 'HistoryChart',
  components: { highcharts: Chart },
    props: {
        title: {type: String, required: true },
        sensor: {type: Object as () => Sensor, required: true },
    },
  setup(props) {
    const { state }  = useState('history-chart');

    const settings = computed(() => state.settings);

    const getData = (): number[][] => {
        const oneHour = 60 * 60 * 1000;
        const firstSampleDate =  Date.now() - 24 * oneHour;
        const data: number [][] = [];
        const kalmanFilter = new KalmanFilter({R: 0.01, Q: 0.5});

        if (props.sensor && props.sensor.samples) {
            props.sensor.samples
                .filter((sample) => sample.date > firstSampleDate)
                .map((sample) =>
                    data.push([sample.date, round(kalmanFilter.filter(sample.value), 0.01)]));
        }
        return data;
    }
    const unitSymbol = computed(() => settings.value.unit(props.sensor.attr.category));
    const yAxisText = computed(() => props.sensor.attr.category.toString() +
                            ' (' + settings.value.unit(props.sensor.attr.category) + ')')
    // round(2.74, 0.1) = 2.7
    // round(2.74, 0.25) = 2.75
    // round(2.74, 0.5) = 2.5
    // round(2.74, 1.0) = 3.0
    const round = (value: number, precision: number) => {
        const prec = precision || (precision = 1.0);
        const inverse = 1.0 / prec;
        return Math.round(value * inverse) / inverse;
    }
    const name = computed(() => {
        return props.sensor.desc.SN + '/' + props.sensor.desc.port;
    })
    const options = reactive ({
        // eslint-disable-next-line @typescript-eslint/no-this-alias
            chart: {
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                type: 'spline',
            },
            title: {
                text: 'Senaste 24 timmar',
                x: -20, // center
            },
            subtitle: {
                text: 'Givare: ' + name.value,
                x: -20,
            },
            xAxis: {
                type: 'datetime',
            },
            yAxis: {
                title: {
                text: yAxisText.value,
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
                valueSuffix: unitSymbol.value,
            },

            series: [{
                name: props.title,
                data: getData(),
            }],
            time: {
                getTimezoneOffset(timestamp: number): number {
                    const zone = settings.value.zone;
                    const timezoneOffset = -moment.tz(timestamp, zone).utcOffset();
                    return timezoneOffset;
                },
            },
    });

    return { options };
  }
});

</script>
