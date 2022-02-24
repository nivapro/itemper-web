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
import { ref, defineComponent} from '@vue/composition-api';
import { WiFiWriteData } from './device-data';
import { useBluetooth } from './use-bluetooth';
import useDeviceState from './use-device-state';

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
    const { deviceState } = useDeviceState();
    const  { current, device, available } = useBluetooth();
    const loading = ref(false);
    const updated = ref(false);

    async function syncColor(event: string) {
      const cached = deviceState.deviceData.color.slice();
      try {
            loading.value = true;
            deviceState.deviceData.color = event.slice();
            await device().writeValue(deviceState.deviceData);
        } catch {
            deviceState.deviceData.color = cached;
        } finally {
          loading.value = false;
        }
    }
    async function syncName(event: string) {
      const cached = deviceState.deviceData.name.slice();
      try {
            loading.value = true;
            deviceState.deviceData.name = event.slice();
            await device().writeValue(deviceState.deviceData);
        } catch {
            deviceState.deviceData.color = cached;
        } finally {
          loading.value = false;
        }
    }
    async function retrieveCurrentWiFiNetwork() {
      try {
        const wifi = await current().readValue();
        deviceState.networks.current.ssid = wifi.ssid;
        deviceState.networks.current.security = wifi.security;
        deviceState.networks.current.quality = wifi.quality;
        deviceState.networks.current.channel = wifi.channel;
        log.info('device-stepper-content-step2.retrieveCurrentWiFiNetwork deviceState=' +
                  JSON.stringify(deviceState));
      } catch (e) {
        log.error('device-stepper-content-step2.retrieveCurrentWiFiNetwork: e=' + e);
      }
    }
    async function syncCurrentNetwork(newWiFi: WiFiWriteData) {
      try {
          log.debug('device-stepper-content-step2.syncCurrentNetwork: newWiFi=' + JSON.stringify(newWiFi));
          loading.value = true;
          await current().writeValue(newWiFi);
          await retrieveCurrentWiFiNetwork();
        } catch (e) {
             log.error('device-stepper-content-step2.syncCurrentNetwork: e=' + e);
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