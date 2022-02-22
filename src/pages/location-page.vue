<template>
        <v-row>
            <v-col v-for="(item,id) in state.locations.all" :key="id">
                <location-card  
                    :location="item"
                    :id="id"
                    :height=400
                >
                </location-card> 
               <v-chip v-if="locationCount === 0" transition="scale-transition" >Det finns inga platser.</v-chip>
            </v-col>
        </v-row>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, computed, watch, toRefs, toRef, onMounted, watchEffect } from '@vue/composition-api';

// Store
import { Status } from '@/store/user';
import { useState } from '@/store/store';

// Services
import { log } from '@/services/logger';
import { loginRequired, isPublicPath } from '@/pages/router';

// Child components
import LocationCard from '../features/locations/location-card.vue';


export default defineComponent({
  name: 'LocationPage',
  components: { LocationCard },

  setup(props, context) {

    const {state, startRetrieveState, stopRetrieveState, retrievingState } = useState('location-page');

    const locationCount = computed(() => state.locations.all.length);

    log.debug('location-page.setup');
    return { state, locationCount };
  },
});

</script>
