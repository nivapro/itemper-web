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
                    top
                    left>
                    <v-icon color="yellow--text">fa-plus</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>
        <slot ></slot>
    </v-dialog>
</template>
<script lang="ts">
                // <v-fab-transition v-if="showFab">
                //     <v-btn
                //         :key="activeFab.icon"
                //         :color="activeFab.color"
                //         fab
                //         small
                //         dark
                //     >
                //         <v-icon>{{ activeFab.icon }}</v-icon>
                //     </v-btn>
                // </v-fab-transition>
import { ref, defineComponent, watch, computed, watchEffect } from '@vue/composition-api';
import { log } from '@/services/logger';

export default defineComponent({
    name: 'NewItemDialogue',

    setup(props, context) {
        const dialog =  ref(false);
        const showFabButton =  ref(true);
        const closeDialog = () => {
            dialog.value = false;

        };

        return { closeDialog, dialog, showFabButton};
    },
});
</script>
