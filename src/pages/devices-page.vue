<template>
    <div>
        <NewDeviceMenu/>
        <v-container fluid grid-list-md>
            <v-layout row wrap>
                <v-flex v-for="(item,id) in state.devices.all" :key="id">
                    <device-card  
                        :device="item"
                        :id="id"
                    >
                    </device-card>
                </v-flex>
                <v-chip v-if="deviceCount === 0" transition="scale-transition" >Det finns inga enheter ännu</v-chip>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';

// Store
import { useState } from '@/store/store';

// Services
import { log } from '@/services/logger';
// Child components
import DeviceCard from '@/features/devices/device-card.vue';
import NewDeviceMenu from '@/features/devices/new-device-menu.vue';
export default defineComponent({
  name: 'DevicesPage',
  components: { DeviceCard, NewDeviceMenu },

  setup() {
    const { state } = useState('device-page');

    const deviceCount = computed (() => state.devices.all.length);

    log.debug('DevicePage.setup');
    return { state, deviceCount };
  },
});
</script>
