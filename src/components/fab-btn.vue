<template>
    <v-dialog v-model="dialog" @close="closeDialog" @cancel="closeDialog" persistent max-width="800">
        <template v-slot:activator="{ on }">
            <v-fab-transition>
                <v-btn class="mx-2 elevation-2" 
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
        <slot></slot>
    </v-dialog>
</template>
<script lang="ts">
import { ref, defineComponent } from '@vue/composition-api';
import {log} from '@/services/logger';
export default defineComponent({
    name: 'NewItemDialogue',

    setup() {
        const dialog =  ref(false);
        const closeDialog = () => {
            log.info('new-item-dialog. closeDialog, dialog=false');
            dialog.value = false;
        };
        const cancelDialog = () => {
            log.info('new-item-dialog. cancelDialog, dialog=false');
            dialog.value = false;
        };

        return { closeDialog, dialog, cancelDialog};
    },
});
</script>
