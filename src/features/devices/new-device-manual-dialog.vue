<template>
    <v-dialog v-model="dialog" persistent max-width="800">
            <v-card
            class="mb-12"
            >
            <v-alert
              :value="alert"
              color="pink"
              dark
              border="top"
              icon="mdi-home"
              transition="scale-transition"
            >
              {{ alertMessage }}
            </v-alert>
              <v-card-title v-if="!created" >Create a new device</v-card-title>
              <v-card-title v-else >New device: {{ name }}</v-card-title>
              <v-card-subtitle  v-if="!created">
                Fill in a device name and choose a color.
                The Shared Access key is available after you created the device.
              </v-card-subtitle>
              <v-card-text>
                  <device-settings-list>
                      <DeviceNameSetting
                        :value="name"
                        @input="syncName"
                        />
                      <DeviceColorSetting 
                        :value="color"
                        @input="syncColor"
                      />
                      <DeviceApiKeySetting
                        :value="key"
                      />
                  </device-settings-list>
              </v-card-text>
              <v-card-actions>
                <v-btn text v-if="!created" @click="close">cancel</v-btn>
                <v-btn text v-else color="primary" @click="close">close</v-btn>
                <v-btn v-if="!created" color="primary" :loading="loading" :disabled="!colorDone || !nameDone"
                    @click="create">Create</v-btn>
              </v-card-actions>
            </v-card>
           
    </v-dialog>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import { computed, ref, watchEffect } from '@vue/composition-api'; 
import { defineComponent } from '@vue/composition-api';

import { log } from '@/services/logger';

import DeviceSettingsList from '@/features/device-settings/device-settings-list.vue';
import DeviceNameSetting from '@/features/device-settings/device-name-setting.vue';
import DeviceColorSetting from '@/features/device-settings/device-color-setting.vue';
import DeviceApiKeySetting from '@/features/device-settings/device-api-key-setting.vue';

export default defineComponent({
  name: 'NewDeviceManualDialog',
  props: {
    open: { type: Boolean, default: false }
  },
  components: {
      DeviceSettingsList,
      DeviceNameSetting,
      DeviceColorSetting,
      DeviceApiKeySetting,
     },
  setup(props, context) {

    const dialog = ref(false);
    const alert = ref(false);
    const alertMessage = ref('');
    const name  = ref('');
    const color = ref('');
    const key = ref('');

    watchEffect(() => {
      dialog.value = props.open;
    })
    const close = () => {
      dialog.value = false;
      name.value = '';
      color.value = '';
      key.value = '';
      colorDone.value = false;
      nameDone.value = false;
      context.emit('close');
    };

    const showAlert = (text: string) => {
      alertMessage.value = text;
      alert.value = true;
      setTimeout(() => {
        alert.value = false;
        alertMessage.value = '';
      }, 4_000);
    };
    const nameDone = ref(false);
    const colorDone = ref(false);
    const loading = ref(false);

    const created = computed(() => nameDone.value && colorDone.value && key.value !== '')

    async function syncName (event: string) {
      name.value = event.slice();
      nameDone.value=true;
    }
    async function syncColor(event: string) {
      color.value = event.slice();
      colorDone.value = true;
    }
    async function create ()  {
      try { 
        loading.value = true;
        const dev = await Vue.$store.devices.createDevice(name.value, color.value);
        key.value = dev.key;
        loading.value = false;
      } catch (e) {
        loading.value = false;
        const errorMsg = "Cannot create device: " + e;
        showAlert(errorMsg);
        log.error('ne-device-manual-dialog: Cannot save device, error=' + JSON.stringify(e, null, 2));
      }

    }

    return {  alert, alertMessage, key, loading, close, color, colorDone, create, created, dialog,
              name, nameDone, syncColor, syncName };
  },
});
</script>
