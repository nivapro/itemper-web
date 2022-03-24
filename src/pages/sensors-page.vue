<template>
  <v-row>
    <v-col>
      <v-data-table
        :items-per-page="-1"
        :dense="sensorCount > 15" 
        :headers="headers"
        :items="state.sensors.all"
        :search="search"
        :expanded.sync="expanded"
        @item-expanded="handleSubscription"
        show-expand
        item-key="name"
        sort-by="name"
        hide-default-footer
      >
        <template v-slot:top>
          <v-chip class="ma-2" color="primary" label>
            <v-icon left>fa-sensor</v-icon>
            Subscribers: {{subscribersCount}}, samples: {{sampleCount}}
          </v-chip>
          <p>{{subscribers}}</p>
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
            <p v-if="item.desc.SN === latest.desc.SN && item.desc.port === latest.desc.port ">
              Senast: {{ sample(latest) }}, tidpunkt: {{ time(latest) }}
            </p>
            <p v-else>
              item.desc.SN: {{item.desc.SN}},  latest.desc.SN: {{ latest.desc.SN }}
              , item.desc.port: {{item.desc.port}},  latest.desc.port: {{latest.desc.port}}
              , Senast: {{ sample(latest) }}, tidpunkt: {{ time(latest) }}
            </p>
            <history-chart title="Historik" :sensor="item"/>
          </td>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref } from '@vue/composition-api';
import { Sensor } from '@/models/sensor';
import { SensorLog, Descriptor, Sample } from '@/models/sensor-data';
import { Callback, CallbackObject } from '@/services/sensor-log-monitor';
import { useState } from '@/store/store';
import HistoryChart from '@/components/history-chart.vue';

import { log } from '@/services/logger';

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
    const desc: Descriptor = {SN: '', port: 0 };
    const samples: Sample[] = [{value: 0.0, date: 0}];
    const latest = reactive({ desc, samples } as SensorLog)
    const sampleCount = ref(0);

    const sensorCount = computed(() => state.sensors.all.length);

    const subscribersCount = computed (() => {
      return state.itemper.logMonitor.Count;
    })
    const subscribers = computed (() => {
      const keys = state.itemper.logMonitor.Subscribers.keys;
      return JSON.stringify(keys);
    });
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

    const logLatest: Callback = (sensorLog: SensorLog) => {
      log.debug('sensor-page.logLatest: ' + JSON.stringify(sensorLog.desc));
      sampleCount.value++;
      latest.desc = sensorLog.desc;
      const latestSample = sensorLog.samples[sensorLog.samples.length - 1];
      if (latest.samples.length === 0 ) {
        latest.samples.push(latestSample);
      } else {
        latest.samples[0] = latestSample;
      }
    }
    interface ItemExpandedEvent {
      item: Sensor;
      value: boolean;
    }
    const subscriptions: Map<string, CallbackObject> = reactive(new Map());
    const handleSubscription = (event: ItemExpandedEvent) =>  {
      if (event.value) {
        const subscription = state.itemper.logMonitor.subscribe(event.item.desc, logLatest.bind(this));
        subscriptions.set(state.itemper.logMonitor.sensorDesc(event.item.desc), subscription);
    } else {
         const subscription = subscriptions.get(state.itemper.logMonitor.sensorDesc(event.item.desc));
         if (subscription) {
          state.itemper.logMonitor.unSubscribe(subscription);
         } else {
            log.error('sensor-page.handleSubscription: No subscription ' + JSON.stringify(event.item.desc));
         }
      }
    }
    return { category, count, expanded, latest, location, handleSubscription, headers, name, sample, sampleCount,
             search, sensorCount, state, subscribers, subscriptions, subscribersCount, time };
  },
});
</script>
