<template>
        <v-expansion-panels>
          <slot></slot>
        </v-expansion-panels>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { log } from '@/services/logger';
export default defineComponent({
  name: 'DeviceSettingList',
  components: {},

  setup() {
    log.debug('device-settings-list.setup');
    return {};
  },
});
</script>
