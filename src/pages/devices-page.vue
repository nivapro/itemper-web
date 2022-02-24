<template>
    <div>
        <new-item-dialogue v-model="dialog">
            <NewDeviceStepper @close="closeDialog"></NewDeviceStepper>
        </new-item-dialogue>
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
import { ref, computed, defineComponent } from '@vue/composition-api';

// Store
import { useState } from '@/store/store';

// Services
import { log } from '@/services/logger';
// Child components
import DeviceCard from '@/features/devices/device-card.vue';
import NewItemDialogue from '@/components/new-item-dialogue.vue';
import NewDeviceStepper from '@/features/devices/new-device-stepper.vue';
export default defineComponent({
  name: 'DevicesPage',
  components: { DeviceCard, NewItemDialogue, NewDeviceStepper },

  setup() {
    const { state } = useState('device-page');
    const dialog = ref(false);

    const deviceCount = computed (() => state.devices.all.length);

    const closeDialog = () => {
        dialog.value = false;
    };
    log.debug('DevicePage.setup');
    return { state, deviceCount, closeDialog, dialog };
  },
});
</script>
