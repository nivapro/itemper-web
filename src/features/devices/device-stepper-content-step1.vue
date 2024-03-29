<template>
        <v-stepper-content step="1" transition="scroll-x-transition">
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
            <div v-if="connected && isAllActionsDone">
                <v-card-title  class="headline">
                    <v-row>
                      <v-col cols="1"><v-icon color="blue">fab fa-bluetooth</v-icon></v-col>
                      <v-col> New device found</v-col>
                    </v-row>    
                </v-card-title>
                <v-card-text>
                    <v-icon color="green">fa-check</v-icon> You paired with a device<span v-if="btName !==''"> ({{btName}})</span>. 
                    You can change the configuration following this guide.
                </v-card-text>
                <v-card-actions>
                  <v-btn text color="primary" :loading="disconnecting"  @click="disconnect">Disconnect</v-btn>
                </v-card-actions>
            </div>
            <div v-else>
                <v-card-title  class="headline">
                  <v-row>
                    <v-col cols="1"><v-icon color="blue">fab fa-bluetooth-b</v-icon></v-col>
                    <v-col>
                        <span v-if="btName !==''">{{btName}}</span>
                        <span v-else>Search for device</span>
                    </v-col>
                  </v-row>
                  </v-card-title>
                <v-card-text>
                    <span v-if="disconnected">Turn on your iTemper device, click Scan and pair the device.</span>
                    <span v-else>Please wait until the connection is complete. This may take a while</span>
                    
                    <v-list flat>
                      <v-subheader>Progress</v-subheader>
                        <v-list-item
                          v-for="(action, i) in actions"
                          :key="i"
                          inactive
                        >
                          <v-list-item-icon v-if="isActionStarted(i) && action.loading">
                            <v-progress-circular
                              :indeterminate="action.loading"
                              color="grey"
                            ></v-progress-circular>
                          </v-list-item-icon>
                          <v-list-item-icon v-if="action.done">
                            <v-icon  color="green">fa-check</v-icon>
                          </v-list-item-icon>
                          <v-list-item-icon v-if="action.error">
                            <v-icon  color="red">fa-times</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content v-if="!action.error">
                            <v-list-item-title v-text="action.text"></v-list-item-title>
                          </v-list-item-content>
                          <v-list-item-content v-else>
                            <v-list-item-title v-text="action.errorText"></v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                </v-card-actions>
            </div>
          </v-card>
          <v-btn @click="cancel()" text>Cancel</v-btn>
          <v-btn :disabled="connecting" color="primary" @click="scan()">
              Scan
              <template v-slot:loader>
                <span class="custom-loader">
                  <v-icon>fa-sync</v-icon>
                </span>
              </template>
          </v-btn>
          <v-btn @click="nextStep" text>Continue</v-btn>
        </v-stepper-content>
</template>

<script lang="ts">
import { ref, reactive } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { defineComponent, computed } from '@vue/composition-api';

import { WiFiNetwork } from './device-data';
import { Device } from './device';
import { useDeviceState } from './use-device-state';
import { useBluetooth } from './use-bluetooth';

import { log } from '@/services/logger';

export default defineComponent({
  name: 'DeviceStepperContentStep1',
  components: { },

  setup(props, context) {
    const { deviceState, resetDeviceState, setDevice } = useDeviceState();

    const  { btName, connecting, connected, connect, disconnected,
              disconnect, disconnecting, current, device, available,
              deviceKey, deviceName, deviceColor } = useBluetooth();

    const newDevice = ref(false);
    const newDeviceKey = ref('');
    const alert = ref(false);
    const alertMessage = ref('');
    const currentAction = ref(-1);
    const activity = ref(1);
    const actions = reactive([
        { text: 'Pair Bluetooth device',
          loading: false,
          done: false,
          error: false,
          errorText: 'Cannot connect to device'
        },
        { text: 'Read device information',
          loading: false,
          done: false,
          error: false,
          errorText: 'Cannot retrieve device information'
        },
        { text: 'Read WiFi information',
          loading: false,
          done: false,
          error: false,
          errorText: 'Cannot retrieve WiFi information'
          },
        { text: 'Verify Device key, create if needed',
          loading: false,
          done: false,
          error: false,
          errorText: 'Cannot create device key'
          },
      ]);
    const showNewDeviceDiag = computed(() => newDevice.value === true);
    const resetActions = ()  => {
      currentAction.value = -1;
      actions.forEach((i) =>  {
        i.loading = false;
        i.done = false;
        i.error = false;
      });
    };
    const startFirstAction = () => {
      resetActions();
      nextAction();
    };
    const nextAction = () => {
      if (currentAction.value < actions.length) {
      currentAction.value++;
      actionStarted();
      log.info('device-stepper-content-step1, nextAction= ' + currentAction.value);
      }
    };
    const actionStarted = () => {
      log.info('device-stepper-content-step1, actionStarted= %s', currentAction.value);
      actions[currentAction.value].loading = true;
      actions[currentAction.value].done = false;
      actions[currentAction.value].error = false;
    };
    const actionDone = () => {
      log.info('device-stepper-content-step1, actionDone= %s', currentAction.value);
      actions[currentAction.value].loading = false;
      actions[currentAction.value].done = true;
      actions[currentAction.value].error = false;
    };
    const actionError = (errorMessage: string) => {
      log.info('device-stepper-content-step1, actionError= %s', currentAction.value);
      log.error('device-stepper-content-step1, actionError, message= %s', errorMessage);
      actions[currentAction.value].errorText = errorMessage;
      actions[currentAction.value].loading = false;
      actions[currentAction.value].done = false;
      actions[currentAction.value].error = true;
    };
    const newDeviceName = computed(() => deviceState.deviceData.name);
    const newDeviceColor = computed(() => deviceState.deviceData.color);
    const isFirstActionStarted = computed(() => {
      return actions[0].loading || actions[0].done || actions[0].error;
    });
    const isAllActionsDone = computed(() => {
      let done = true;
      actions.forEach((i) => done = done && i.done);
      return done;
    });
    const isActionStarted = (index: number) => {
      const thisAction = actions[index];
      return thisAction.loading || thisAction.done || thisAction.error;
    };
    const deviceIDOf = (key: string) => {
      const deviceID = key.slice(0, key.indexOf(':'));
      log.info('device-stepper-content-step1.deviceIDOf=' + deviceID);
      return key.slice(0, key.indexOf(':'));
    };
    const showAlert = (text: string) => {
      alertMessage.value = text;
      alert.value = true;
      setTimeout(() => {
        alert.value = false;
        alertMessage.value = '';
      }, 4_000);
    };
    async function scan() {
      try {
         // Action 0:
        startFirstAction(); 
        await connect();
        actionDone();
        // Action 1: DeviceInfo
        nextAction();
        await retriveDeviceData();
        actionDone();
        // Action 2: WiFi
        nextAction();
        await retrieveCurrentWiFiNetwork();
        await retrieveAvailableWiFiNetworks();
        actionDone();
        // Action 3: Create device if it does not exist
        nextAction();
        const existingDevice = Vue.$store.devices.all.filter((dev) => dev.name === deviceState.deviceData.name );
        if (existingDevice.length === 0) {
          // No device with the same name exists
          // We create a new deice with the name (and color) we retrieved from the Bluetooth device.
          const name = deviceState.deviceData.name;
          const color = deviceState.deviceData.color;

          // Create the device and write back to the device
          const dev = await Vue.$store.devices.createDevice(name, color);
          log.info('device-stepper-content-step1.scan: - create a new device!');
          setDevice(dev);
          deviceState.deviceData.deviceID = dev.deviceID;
          deviceState.deviceData.key = dev.key;
          deviceState.deviceData.name = dev.name;
          deviceState.deviceData.color = dev.color;

        } else {
          const dev = existingDevice[0];
          setDevice(dev);
          deviceState.deviceData.deviceID = dev.deviceID;
          deviceState.deviceData.key = dev.key;
          deviceState.deviceData.name = dev.name;
          deviceState.deviceData.color = dev.color;
        }
        // Write back API key to the device. 
        await deviceKey().writeValue({ key: deviceState.deviceData.key});
        log.debug('device-stepper-content-step1.scan: new device - writeValue Key ' + deviceState.deviceData.key);
        await deviceName().writeValue({ name: deviceState.deviceData.name});
        log.debug('device-stepper-content-step1.scan: new device - writeValue name ' + deviceState.deviceData.name);
        await deviceColor().writeValue({ color: deviceState.deviceData.color});
        log.debug('device-stepper-content-step1.scan: new device - writeValue color ' + deviceState.deviceData.color);

        actionDone();
      } catch (e) {
        const errorMsg = e as string;
        actionError(errorMsg);
        showAlert(errorMsg);
        log.error('device-stepper-content-step1.scan Cannot connect to BLE device, error=' + JSON.stringify(e, null, 2));
      }
    }

    async function retriveDeviceData(): Promise<void> {
        try {
          const deviceConfig = await device().readValue();
          log.info('device-stepper-content-step1.retriveDeviceData: device data read');
       //   const name = await deviceName().readValue();
       //   log.info('device-stepper-content-step1.retriveDeviceData, devicename: ' + name);
          resetDeviceState();
          // Device data
          deviceState.deviceData.name = deviceConfig.name;
          deviceState.deviceData.deviceID = deviceIDOf(deviceConfig.key);
          deviceState.deviceData.key = deviceConfig.key;
          deviceState.deviceData.color = deviceConfig.color;
        } catch (e) {
              log.error('device-stepper-content-step1.retriveDeviceData: ' + e);
        }
    }
    async function retrieveCurrentWiFiNetwork() {
      try {
        const wifi = await current().readValue();
        deviceState.networks.current.ssid = wifi.ssid;
        deviceState.networks.current.security = wifi.security;
        deviceState.networks.current.quality = wifi.quality;
        deviceState.networks.current.channel = wifi.channel;
        log.info('device-stepper-content-step1.retrieveCurrentWiFiNetwork deviceState= %s',
                  JSON.stringify(deviceState));
      } catch (e) {
        log.error('device-stepper-content-step1.retrieveCurrentWiFiNetwork: ' + e);
      }
    }
    async function retrieveAvailableWiFiNetworks() {
        try {
          await available().subscribe((network: WiFiNetwork) => {
              const found = deviceState.networks.available.find((n) =>
                          n.ssid === network.ssid && n.channel === network.channel);
              if (found) {
                found.quality = network.quality;
                found.security = network.security;
              } else {
                deviceState.networks.available.push(reactive(
                {   ssid: ref(network.ssid),
                    security: ref(network.security),
                    quality: ref(network.quality),
                    channel: ref(network.channel),
                }));
              }
          });
        } catch (e) {
              log.error('device-stepper-content-step1.retrieveAvailableWiFiNetworks: invalid device configuration');
              actionError(e as string);
        }
    }
    const nextStep = () => {
      log.info('device-stepper-content-step1.nextstep');
      context.emit('forward', deviceState);
    };
    async function deviceCreated(event: Device) {
      deviceState.deviceData.deviceID = event.deviceID;
      deviceState.deviceData.key = event.key;
      nextStep();
    }
    const ready = computed(() => isAllActionsDone && connected);

    const cancel = () => {
      log.info('device-stepper-content-step1.cancel')
      try {
        disconnect();
        resetActions();
      } catch (e){
        log.error('device-stepper-content-step1.cancel: ' + e as string);
      }

      context.emit('cancel', deviceState);
    };

    return {  alert, alertMessage, btName, connecting, connected, deviceState, disconnect, disconnecting,
              disconnected, showNewDeviceDiag,
              ready, scan, deviceCreated, newDeviceName, newDeviceColor, newDeviceKey,
              cancel, nextStep, activity, actions, isAllActionsDone, isFirstActionStarted, isActionStarted };
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
