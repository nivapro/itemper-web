<template>
    <div>
        <LocationsAppFabComponent v-model="dialog" v-if="route === 'locations'" @close="closeDialog"/>
        <DevicesAppFabComponent v-model="dialog" v-if="route === 'devices'" @close="closeDialog"/>        
    </div>
</template>
<script lang="ts">
import { ref, computed, defineComponent } from '@vue/composition-api';
import DevicesAppFabComponent from '../features/devices/devices-app-fab-component.vue';
import LocationsAppFabComponent from '../features/locations/locations-app-fab-component.vue';

export default defineComponent({
    name: 'AppFabButton',
    components: { DevicesAppFabComponent, LocationsAppFabComponent },
    props: {
        route: {type: String, required: true },
    },
    setup(props) {
        const dialog =  ref(false);
        const fabEnabledRoute = computed (() => {
            return props.route === 'devices' || props.route === 'locations'
        });

        const closeDialog = () => {
            dialog.value = false;
        };

        return { closeDialog, dialog, fabEnabledRoute};
    },
});
</script>
