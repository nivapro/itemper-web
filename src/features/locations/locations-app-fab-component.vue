<template>
    <v-dialog v-model="dialog"  persistent max-width="800">
        <template v-slot:activator="{ on }">
            <v-fab-transition>
                <v-btn class="mx-2 elevation-2" 
                    v-on="on"
                    fab 
                    absolute
                    small
                    color="blue"
                    bottom
                    left>
                    <v-icon color="white">fa-plus</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>
        <new-location-card @close="closeDialog" />
    </v-dialog>
</template>
<script lang="ts">
import { ref, defineComponent } from '@vue/composition-api';

import NewLocationCard from '@/features/locations/new-location-card.vue';

export default defineComponent({
    name: 'LocationsAppFabComponent',
    components: {
        NewLocationCard,
    },

    setup(props, context) {
        const dialog =  ref(false);

        const closeDialog = () => {
            dialog.value = false;
            context.emit('close')
        };

        return { closeDialog, dialog };
    },
});
</script>
