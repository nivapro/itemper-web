<template>
  <div class="sensors">
    <h1>Sensors</h1>
    <ul>
      <li v-for="sensor in sensors" :key="sensor._id">
        <h1>{{ name (sensor) }} </h1>
        <p>{{ sample (sensor) }} </p>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-property-decorator';
import { defineComponent, onMounted } from '@vue/composition-api';

import { SensorData, Category } from '@/models/sensor-data';
import { useSensors } from '../features/sensors/sensors-store';

import { log } from '@/services/logger';

export default defineComponent({
  name: 'SensorPage',
  components: {},

  setup() {
    const state  = useSensors();
    const sensors = state.sensors;
    const name = (sensor: SensorData) => {
      return sensor.attr.model + ':' + sensor.desc.SN + '/' + sensor.desc.port;
    };
    const sample = (sensor: SensorData) => {
      const unitSymbol = Vue.$store.settings.unit(Category.Temperature);
      if (sensor.samples.length > 0) {
        const lastSample = sensor.samples[sensor.samples.length - 1];
        const lastDate = new Date(lastSample.date);
        const age =  Date.now() - lastSample.date;
        const OneDay = 24 * 60 * 60 * 1000;
        const ageText = age > OneDay
          ? ' (' + lastDate.toLocaleDateString() + ')'
          : age > 1_000
            ? ', age: ' + age / 1000 + ' s'
            : ', age: ' + age + ' ms';
        const date =  age < OneDay
          ? lastDate.toLocaleTimeString() + ageText
          : lastDate.toLocaleTimeString() + ' (' + lastDate.toLocaleDateString() + ')';
        return lastSample.value.toPrecision(3) + unitSymbol + ', ' + date;
      } else {
        return '- ' + unitSymbol;
      }
    };

    onMounted(() => {
      state.getSensorsSamples(10);
    });
    log.debug('SensorPage.setup: sensors: ' + JSON.stringify(sensors));
    return { sensors, name, sample };
  },
});
</script>