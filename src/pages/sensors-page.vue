<template>
  <div class="sensors">
    <h1>Sensors</h1>
    <v-data-table
    :headers="headers"
    :items="items"
    />
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-property-decorator';
import { defineComponent, onMounted, reactive, ref, watchEffect } from '@vue/composition-api';

import { SensorData, Category } from '@/models/sensor-data';
import { useSensors } from '../features/sensors/sensors-store';

import { log } from '@/services/logger';
interface Item {
    name: string,
    category: string,
    sample: string,
    time: string,
    age: string,
    count: string
}
export default defineComponent({
  name: 'SensorPage',
  components: {},

  setup() {
    const state  = useSensors();
    const sensors = reactive(state.sensors);
    const  headers = [
          {
            text: 'Givare',
            align: 'start',
            value: 'name',
          },
          { text: 'Kategori', value: 'category' },
          { text: 'Värde', value: 'sample' },
          { text: 'Tidpunkt', value: 'time' },
          { text: 'Ålder', value: 'age' },
          { text: 'Antal', value: 'count' },
        ];
    let items = ref([] as Item[]);

    watchEffect (() =>
      items.value = sensors.map((s) => {
            const item: Item = {
              name: name(s),
              category: category(s),
              sample: sample(s),
              time: time(s),
              age: age(s),
              count: count(s),
            };
            return item;
      })
    );
    const name = (sensor: SensorData) => {
      return sensor.attr.model + ':' + sensor.desc.SN + '/' + sensor.desc.port;
    };
    const category = (sensor: SensorData) => {
      return sensor.attr.category.toString();
    }
    const sample = (sensor: SensorData) => {
      const unitSymbol = Vue.$store.settings.unit(Category.Temperature);
      if (sensor.samples.length > 0) {
        const lastSample = sensor.samples[sensor.samples.length - 1];
        return lastSample.value.toPrecision(3) + unitSymbol;
      } else {
        return '- ' + unitSymbol;
      }
    };
    const time = (sensor: SensorData) => {
       if (sensor.samples.length > 0) {
        const lastSample = sensor.samples[sensor.samples.length - 1];
        const lastDate = new Date(lastSample.date);
        return lastDate.toLocaleTimeString();
      } else {
        return '- ';
      } 
    }
    const age = (sensor: SensorData) => {
      if (sensor.samples.length > 0) {
        const lastSample = sensor.samples[sensor.samples.length - 1];
        const age =  Date.now() - lastSample.date;
        const OneDay = 24 * 60 * 60 * 1000;
        const ageText = age > OneDay
          ? Math.floor(age/OneDay).toString() + ' day(s)'
          : age > 1_000
            ? age / 1000 + ' s'
            : age + ' ms';
        return ageText;
      } else {
        return '- ';
      }
    };
    const count = (sensor: SensorData) => {
      return sensor.samples.length.toString();
    }
    onMounted(() => {
      state.getSensorsSamples(10);
    });
    log.debug('SensorPage.setup: sensors: ' + JSON.stringify(sensors));
    return { headers, items };
  },
});
</script>