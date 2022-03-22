<template>
  <v-sparkline
    :value="value"
    padding=8
    color="white"
    line-width=2
    type="trend"
    auto-draw
  ></v-sparkline>
</template>
<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import KalmanFilter from 'kalmanjs';
import { Sensor } from '@/models/sensor';

export default defineComponent({
  name: 'HistorySparkline',
  components: { },
    props: {
        sensor!: {type: Object as () => Sensor },
    },
  setup(props) {

    const round = (value: number, precision: number) => {
        const prec = precision || (precision = 1.0);
        const inverse = 1.0 / prec;
        return Math.round(value * inverse) / inverse;
    }
    const value = computed (() => {
        const oneHour = 60 * 60 * 1000;
        const firstSampleDate =  Date.now() - 24 * oneHour;
        const kalmanFilter = new KalmanFilter({R: 0.01, Q: 0.5});
        const data: number[] = [];
        if (props.sensor && props.sensor.samples) {
            props.sensor.samples
                .filter((sample) => sample.date > firstSampleDate)
                .map((sample) =>
                    data.push(round(kalmanFilter.filter(sample.value), 0.01)));
        }
        return data;
    });

    return { value };
  }
});
</script>
