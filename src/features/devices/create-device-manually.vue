<template>
        <v-stepper-content step="1" transition="scroll-x-transition">
        <v-card
          class="mb-12"
        >
          <new-device
            :name="newDeviceName"
            :color="newDeviceColor"
            v-model="newDevice"
            @created="deviceCreated"/>
            <v-card-actions>
            </v-card-actions>
        </v-card>
</template>

<script lang="ts">
import { ref, reactive, onBeforeUpdate, onUnmounted, onActivated } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { defineComponent, onMounted, watchEffect, computed } from '@vue/composition-api';

import { SensorData, Category } from '@/models/sensor-data';
import { DeviceData, DeviceState, DeviceWiFiData, WiFiNetwork } from './device-data';
import { Device } from '@/features/devices/device';
import useDeviceState from './use-device-state';
import { useBluetooth } from './use-bluetooth';
import { BtStatus } from '@/features/bluetooth-device/bluetooth-service';

import { log } from '@/services/logger';
import { error } from 'console';

import NewDevice from './new-device.vue';
enum SavedStatus { NotSaved, Saving, Saved}
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;

export default defineComponent({
  name: 'DeviceStepperContentStep1',
  components: { NewDevice },

  setup(props, context) {
    const { deviceState, resetDeviceState } = useDeviceState();
    const  { btStatus, btName, connecting, connected, connect, disconnected,
              disconnect, disconnecting, current, device, available, deviceName } = useBluetooth();
    const newDevice = ref(false);
    const alert = ref(false);
    const  alertMessage = ref('');
    const currentAction = ref(-1);
    const activity = ref(1);
    const actions = reactive([
      reactive(
        { text: ref('Connecting to Bluetooth services'),
          loading: ref(false),
          done: ref(false),
          error: ref(false),
          errorText: ref('Cannot establish Bluetooth connection')},
        ),
      reactive(
        { text: ref('Retrieving device configuration'),
          loading: ref(false),
          done: ref(false),
          error: ref(false),
          errorText: ref('Cannot retreive device configuration')},
        ),
      ]);
    const currentActionValid = () => {
      return 0 <= currentAction.value && currentAction.value  < actions.length;
    };
    const resetActions = ()  => {
      currentAction.value = -1;
      actions.forEach((i) =>  {
        i.loading = false;
        i.done = false;
        i.error = false;
      });
    };
    const startActions = () => {
      resetActions();
      nextAction();
    };
    const nextAction = () => {
      currentAction.value = currentAction.value + 1;
      actionStarted();
      log.info('device-stepper-content-step1, nextAction= ' + currentAction.value);
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
      if (currentAction.value < actions.length - 1) {
        nextAction();
      }
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
    const isActionsDone = computed(() => {
      let done = true;
      actions.forEach((i) => done = done && i.done);
      return done;
    });
    const deviceIDOf = (key: string) => {
      const deviceID = key.slice(0, key.indexOf(':'));
      log.info('device-stepper-content-step1.deviceIDOf=' + deviceID);
      return key.slice(0, key.indexOf(':'));
    };
    const isActionStarted = (index: number) => {
      const thisAction = actions[index];
      return thisAction.loading || thisAction.done || thisAction.error;
    };
    const showAlert = (text: string) => {
      alertMessage.value = text;
      alert.value = true;
      setTimeout(() => {
        alert.value = false;
        alertMessage.value = '';
      }, 3_000);
    };
    async function scan() {
      try {
        startActions();
        const status = await connectDevice();
        if (status !== BtStatus.Connected) {
          showAlert('Cannot connect device');
          return;
        }
        actionDone();
        await retriveDeviceData();
        const existingDevice = Vue.$store.devices.all
        .filter((dev) => dev.deviceID === deviceState.deviceData.deviceID );
        if (existingDevice.length === 0) {
          log.info('device-stepper-content-step1.scan: - create a new device?');
          newDevice.value = true;
        } else {
          log.debug('device-stepper-content-step1.scan: retrieve network configuration for an existing device:' +
                    JSON.stringify(existingDevice));
          await retrieveCurrentWiFiNetwork();
          await retrieveAvailableWiFiNetworks();
          actionDone();
          nextStep();
        }
      } catch (e) {
        actionError(e);
        log.info('device-stepper-content-step1.scan Cannot connect to BLE device');
      }
    }
    async function connectDevice(): Promise<BtStatus> {
        log.info('device-stepper-content-step1.connectDevice');
        const status = await connect();
        return status;
    }
    async function retriveDeviceData() {
        try {
          const deviceConfig = await device().readValue();
          log.info('device-stepper-content-step1.retriveDeviceData: device data read');
          const name = await deviceName().readValue();
          log.info('device-stepper-content-step1.retriveDeviceData, devicename: ' + name);
          resetDeviceState();
          // Device data
          deviceState.deviceData.name = deviceConfig.name;
          deviceState.deviceData.deviceID = deviceIDOf(deviceConfig.key);
          deviceState.deviceData.key = deviceConfig.key;
          deviceState.deviceData.color = deviceConfig.color;
        } catch (e) {
              log.error('device-stepper-content-step1.retriveDeviceData: invalid device data');
              actionError(e);
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
              actionError(e);
        }
    }
    const writeDeviceConfiguration = () => {
      try {
        device().writeValue(deviceState.deviceData);
      } catch {
        log.error('device-stepper-content-step1: cannot write deviceData=' + JSON.stringify(deviceState.deviceData));
      }
    };
    const nextStep = () => {
      log.info('device-stepper-content-step1.nextstep');
      context.emit('forward', deviceState);
    };
    async function deviceCreated(event: Device) {
      deviceState.deviceData.deviceID = event.deviceID;
      deviceState.deviceData.key = event.key;
      await writeDeviceConfiguration();
      await retrieveCurrentWiFiNetwork();
      await retrieveAvailableWiFiNetworks();
      actionDone();
      nextStep();
    }
    const ready = computed(() => isActionsDone && connected);
    const cancel = () => {
      disconnect();
      resetActions();
      context.emit('cancel', deviceState);
    };

    return {  alert, alertMessage, btName, connecting, connected, deviceState, disconnect, disconnecting,
              disconnected, newDevice,
              ready, scan, deviceCreated, newDeviceName, newDeviceColor,
              cancel, nextStep, activity, actions, isActionsDone, isFirstActionStarted, isActionStarted };
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
