<template>
    <v-dialog v-model="dialog" persistent max-width="800">
        <template v-slot:activator="{ on }">
            <v-fab-transition>
                <v-btn v-if="showFabButton" class="mx-2 elevation-2" 
                    v-on="on"
                    fab 
                    absolute
                    small
                    color="#2591E9"
                    bottom
                    left>
                    <v-icon color="white--text">fa-plus</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>
        <new-device-stepper v-if="showNewDevice" @close="closeDialog" />
        <new-location-card v-if="showNewLocation" @close="closeDialog" />
    </v-dialog>
</template>
<script lang="ts">
import { ref, defineComponent, watch, computed, watchEffect } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { log } from '@/services/logger';
import NewDeviceStepper from '@/features/devices/new-device-stepper.vue';
import NewLocationCard from '@/features/locations/new-location-card.vue';

enum Dialogue { Unknown, Locations, Devices }

export default defineComponent({
    name: 'NewDialogue',
    components: {
        NewLocationCard,
        NewDeviceStepper,
    },

    setup(props, context) {
        const comp = ref (Dialogue.Unknown);
        const dialog =  ref(false);
        const showNewLocation = computed(() => comp.value === Dialogue.Locations );
        const showNewDevice = computed(() => comp.value === Dialogue.Devices );
        const showFabButton = computed(() => comp.value !== Dialogue.Unknown );
        const closeDialog = () => {
            dialog.value = false;
        };
        watchEffect(() => {
            log.debug('new-dialogue.watchEffect, route.name=' + context.root.$route.name);
            switch (context.root.$route.name) {
                case 'locations':
                    comp.value = Dialogue.Locations;
                    break;
                case 'devices':
                    comp.value = Dialogue.Devices;
                    break;
                default:
                    comp.value = Dialogue.Unknown;
                    break;
            }
        });
        return { closeDialog, dialog, showFabButton, showNewDevice, showNewLocation };
    },
});
</script>
