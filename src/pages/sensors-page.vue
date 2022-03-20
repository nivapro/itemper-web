<template>
  <v-container>
    <v-data-table
      :dense="sensorCount > 15" 
      :headers="headers"
      :items="state.sensors.all"
      :search="search"
      :expanded.sync="expanded"
      show-expand
      item-key="name"
      sort-by="name"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Sök givare"
          class="mx-4"
        ></v-text-field>
      </template>
      <template v-slot:[`item.name`]="{ item }">
          {{ name(item) }}
      </template>
      <template v-slot:[`item.location`]="{ item }">
          {{ location(item) }}
      </template>
      <template v-slot:[`item.category`]="{ item }">
          {{ category(item) }}
      </template>
      <template v-slot:[`item.sample`]="{ item }">
          {{ sample(item) }}
      </template>
      <template v-slot:[`item.time`]="{ item }">
          {{ time(item) }}
      </template>
      <template v-slot:[`item.count`]="{ item }">
          {{ count(item) }}
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <history-chart title="Historik" :sensor="item"/>
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { Sensor } from '@/models/sensor';
import { useState } from '@/store/store';

import HistoryChart from '@/components/history-chart.vue';

export default defineComponent({
  name: 'SensorPage',
  components: { HistoryChart },

  setup() {
    const { state }  = useState('sensor-page');
    const expanded = ref([]);
    const search = ref('');
    const  headers = ref([
          {
            text: 'Givare',
            align: 'start',
            value: 'name',
          },
          { text: 'Plats', value: 'location' },
          { text: 'Kategori', value: 'category' },
          { text: 'Värde', value: 'sample' },
          { text: 'Tidpunkt', value: 'time' },
          { text: 'Antal', value: 'count' },
        ]);
    const sensorCount = computed(() => state.sensors.all.length);

    const name = (sensor: Sensor) => {
      return sensor.model + ':' + sensor.desc.SN + '/' + sensor.desc.port;
    };
    const location = (sensor: Sensor) => {
        const location = state.locations.locationOf(sensor.locationId);
        return location ? location.name : '-';
    }
    const category = (sensor: Sensor) => {
      return sensor.category.toString();
    }
    const sample = (sensor: Sensor) => {
      const unitSymbol = state.settings.unit(sensor.category);
      if (sensor.samples.length > 0) {
        const lastSample = sensor.samples[sensor.samples.length - 1];
        return lastSample.value.toPrecision(3) + unitSymbol;
      } else {
        return '- ' + unitSymbol;
      }
    };
    const time = (sensor: Sensor) => {
       if (sensor.samples.length > 0) {
        const lastSample = sensor.samples[sensor.samples.length - 1];
        const lastDate = new Date(lastSample.date);
        return lastDate.toLocaleTimeString();
      } else {
        return '- ';
      } 
    }
    const count = (sensor: Sensor) => {
      return sensor.samples.length.toString();
    }

    return { category, count, expanded, location, headers, name, sample, search, sensorCount, state,
             time };
  },
});
</script>
