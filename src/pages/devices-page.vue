<template>
    <v-row>
        <v-col>
            <v-layout grid-list-md row wrap>
                <v-flex v-for="(item,id) in state.devices.all" :key="id">
                    <device-card  
                        :device="item"
                        :id="id"
                    >
                    </device-card>
                </v-flex>
                <v-chip v-if="deviceCount === 0" transition="scale-transition" >Det finns inga enheter ännu</v-chip>
            </v-layout>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';

// Store
import { useState } from '@/store/store';

// Services
import { log } from '@/services/logger';
// Child components
import DeviceCard from '@/features/devices/device-card.vue';
export default defineComponent({
  name: 'DevicesPage',
  components: { DeviceCard },

  setup() {
    const { state } = useState('device-page');

    const deviceCount = computed (() => state.devices.all.length);

    log.debug('DevicePage.setup');
    return { state, deviceCount };
  },
});
</script>
