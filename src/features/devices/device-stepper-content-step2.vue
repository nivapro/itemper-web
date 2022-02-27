<template>
        <v-stepper-content step="2" transition="scroll-x-transition">
            <v-card
            class="mb-12"
            >
                <v-card-text>
                    <device-settings-list>
                        <DeviceWiFiSetting
                          :value="deviceState.networks.current"
                          :networks="deviceState.networks.available"
                          @connect="syncCurrentNetwork"
                          @switch="switchChanged"
                        />
                        <DeviceNameSetting
                          :value="deviceState.deviceData.name"
                          @input="syncName"
                          />
                        <DeviceApiKeySetting
                          :value="deviceState.deviceData.key"
                        />
                        <DeviceColorSetting 
                          :value="deviceState.deviceData.color"
                          @input="syncColor"
                        />
                    </device-settings-list>
                </v-card-text>
                <v-card-actions>
                </v-card-actions>
            </v-card>
            <v-btn text @click="stepBack">Back</v-btn>
            <v-btn color="primary" @click="nextStep">Continue</v-btn>
        </v-stepper-content>
</template>
<script lang="ts">
import { Vue } from 'vue-property-decorator';

import { ref, defineComponent} from '@vue/composition-api';
import { WiFiWriteData } from './device-data';
import { useBluetooth } from './use-bluetooth';
import { useDeviceState } from './use-device-state';

import DeviceSettingsList from '@/features/device-settings/device-settings-list.vue';
import DeviceNameSetting from '@/features/device-settings/device-name-setting.vue';
import DeviceColorSetting from '@/features/device-settings/device-color-setting.vue';
import DeviceApiKeySetting from '@/features/device-settings/device-api-key-setting.vue';
import DeviceWiFiSetting from '@/features/device-settings/device-wifi-setting.vue';
import { log } from '@/services/logger';

export default defineComponent({
  name: 'DeviceStepperContentStep2',
  components: {
      DeviceSettingsList,
      DeviceNameSetting,
      DeviceColorSetting,
      DeviceApiKeySetting,
      DeviceWiFiSetting,
  },

  setup(props, context) {
    const { deviceState, getDevice } = useDeviceState();
    const  { current, deviceName, deviceColor, available } = useBluetooth();
    const loading = ref(false);
    const updated = ref(false);

    async function syncColor(event: string) {
      const cached = deviceState.deviceData.color.slice();
      const dev = getDevice();
      try {
            loading.value = true;
            deviceState.deviceData.color = event.slice();
            await deviceColor().writeValue({color: deviceState.deviceData.color});
            await Vue.$store.devices.updateColor (deviceState.deviceData.color, dev);
        } catch {
            deviceState.deviceData.color = cached;
        } finally {
          loading.value = false;
        }
    }
    async function syncName(event: string) {
      const cached = deviceState.deviceData.name.slice();
      const dev = getDevice();
      try {
            loading.value = true;
            deviceState.deviceData.name = event.slice();
            await deviceName().writeValue({name: deviceState.deviceData.name});
            await Vue.$store.devices.renameDevice (deviceState.deviceData.name, dev);
        } catch {
            deviceState.deviceData.color = cached;
        } finally {
          loading.value = false;
        }
    }
    async function syncCurrentNetwork(newWiFi: WiFiWriteData) {
      const cached = Object.assign({}, deviceState.networks.current);
      try {
          log.debug('device-stepper-content-step2.syncCurrentNetwork: newWiFi=' + JSON.stringify(newWiFi));
          loading.value = true;
          await current().writeValue(newWiFi);
        } catch (e) {
              deviceState.networks.current = cached;
             log.error('device-stepper-content-step2.syncCurrentNetwork: e=' + e);
             log.debug('device-stepper-content-step2.syncCurrentNetwork: newWiFi=' + JSON.stringify(newWiFi, undefined, 2));
        } finally {
          loading.value = false;
        }
    }
    const switchChanged = (switchedOn: boolean) => {
      if (!switchedOn) { deviceState.networks.current.ssid = ''; }
    };
    const stepBack = () => {
      log.info('device-stepper-content-step2.stepBack', JSON.stringify(deviceState));
      context.emit('backward', deviceState);
    };
    const nextStep = () => {
          available().unsubscribe();
          context.emit('forward');
    };
    return { deviceState, loading, updated, stepBack, syncColor, syncName,
             nextStep, switchChanged, syncCurrentNetwork};
  },
});
</script>
<style>
  .custom-loader {
    animation: loader 1s infinite;
    display: flex;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>