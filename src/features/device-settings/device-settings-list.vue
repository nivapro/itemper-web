<template>
        <v-expansion-panels v-model="panel">
          <slot></slot>
        </v-expansion-panels>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from '@vue/composition-api';
export default defineComponent({
  name: 'DeviceSettingList',
  components: {},
  props: { value: Array, default: [] },

  setup() {
    const panel = ref([]);
    watch(panel, (value) => {
      panel.value = value;

    });
    return {panel};
  },
});
</script>
