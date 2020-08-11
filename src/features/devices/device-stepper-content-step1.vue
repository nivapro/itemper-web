<template>
        <v-stepper-content step="1">
        <v-card
          class="mb-12"
          color="grey lighten-1"
          height="400px"
        >
            <div v-if="connected()">
                <v-card-title  class="headline">
                    <v-row>
                      <v-col cols="1"><v-icon color="blue">fab fa-bluetooth</v-icon></v-col>
                      <v-col> New device found</v-col>
                    </v-row>    
                </v-card-title>
                <v-card-text>
                    <v-icon color="green">fa-check</v-icon> You paired with the device: <code>{{deviceName}}</code>. You can change the configuration below.
                      <v-list dense>
                      <v-list-item-group v-model="item" color="primary">
                        <v-list-item>
                          <v-list-item-icon>
                            <v-icon v-text="items[0].icon"></v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>
                              <v-form v-model="valid" ref="form">
                                <v-text-field
                                  :label="items[0].label"
                                  :prepend-icon="prependIcon"
                                  v-model="deviceName"
                                  :rules="nameRules"
                                  required
                                  clearable
                                ></v-text-field>
                              </v-form>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-icon>
                            <v-icon v-text="items[1].icon"></v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>
                            <v-list-item-title v-text="items[1].text"></v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                </v-card-text>
                <v-card-actions>
                  <v-btn text color="primary" :loading="disconnecting()"  @click="disconnect()">Disconnect</v-btn>
                </v-card-actions>
            </div>
            <div v-else>
                <v-card-title  class="headline">
                  <v-row>
                    <v-col cols="1"><v-icon color="blue">fab fa-bluetooth-b</v-icon></v-col>
                    <v-col>Search for devices</v-col>
                  </v-row>             
                  </v-card-title>  
                <v-card-text>
                    Turn on your iTemper device. 
                    Click Scan!
                    Please wait until the connection is complete.
                    
                    <v-list flat v-if="connecting()">
                      <v-subheader>Progress</v-subheader>
                      <v-list-item-group v-model="action" color="primary">
                        <v-list-item
                          v-for="(action, i) in actions"
                          :key="i"
                        >
                          <v-list-item-icon v-if="action.loading">
                            <v-progress-circular
                              indeterminate
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
                      </v-list-item-group>
                    </v-list>

                </v-card-text>
                <v-card-actions>
                    <v-btn :disabled="connecting()" text color="primary" @click="scan()">
                      Scan
                      <template v-slot:loader>
                        <span class="custom-loader">
                          <v-icon light>fa-sync</v-icon>
                        </span>
                      </template>
                    </v-btn>
                </v-card-actions>
            </div>
        </v-card>
        <v-btn @click="stepBack" text>Cancel</v-btn>
        <v-btn  :disabled="!ready()" color="primary" @click="nextStep">Continue</v-btn>
        </v-stepper-content>
</template>

<script lang="ts">
import { ref, reactive, onBeforeUpdate, onUnmounted, onActivated } from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { defineComponent, onMounted, watchEffect, computed } from '@vue/composition-api';

import { SensorData, Category } from '@/models/sensor-data';
import { DeviceData, DeviceState, DeviceWiFiData } from './device-data';
import { isDeviceDataValid, isWiFiDataValid, isWiFiDataArrayValid, isDeviceStateValid} from './device-data-validators';
import useDeviceState from './use-device-state';
import { useBluetooth, BtStatus } from './use-bluetooth';

import { log } from '@/services/logger';
import { error } from 'console';

enum SavedStatus { NotSaved, Saving, Saved}
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;

export default defineComponent({
  name: 'DeviceStepperContentStep1',
  components: { },

  setup(props, context) {
    const deviceState = useDeviceState();
    const  { btStatus, connecting, connected, connect, disconnected,
              disconnect, disconnecting, current, device, available } = useBluetooth();
    const savedStatus = ref(SavedStatus.NotSaved);
    const deviceName = ref('');
    const prependIcon = ref('');
    const deviceKey = ref('');
    const valid = ref(false);
    const nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^[a-zA-Z0-9\-]+$/.test(v) && !!v && v.length >= 4  || 'Must be at least 4-32 characters, alphanumeric and hyphen characters allowed',
        ];
    const item = ref(1);
    const items = [
        { text: 'Device name', icon: 'fa-edit', label: 'Enter the name of your device',  value: ''},
        { text: 'Device color', icon: 'fa-fill-drip', label: 'Pick device color',  value: '' },
        { text: 'Device key', icon: 'fa-address-card', label: '<auto generated>',  value: '' },
      ];
    const currentAction = ref(0);
    const action = ref(1);
    const actions = reactive([
        { text: ref('Establishing Bluetooth connection'), loading: ref(false), done: ref(false), error: ref(false), errorText: ref('Cannot estblish connection' )},
        { text: ref('Retrieving device configuration'), loading: ref(false), done: ref(false), error: ref(false), errorText: ref('Cannot read configuration') },
      ]);
    const currentActionValid = () => {
      return 0 <= currentAction.value && currentAction.value  < actions.length;
    };
    const resetActions = ()  => {
      currentAction.value = 0;
      actions.forEach((i) =>  {
        i.loading = false;
        i.done = false;
        i.error = false;
      });
      actionStarted();
    };
    const actionStarted = () => {
      log.error('device-stepper-content-step1, actionStarted= %s', currentAction.value);
      actions[currentAction.value].loading = true;
      actions[currentAction.value].done = false;
      actions[currentAction.value].error = false;
    };
    const actionDone = () => {
      actions[currentAction.value].loading = false;
      actions[currentAction.value].done = true;
      actions[currentAction.value].error = false;
      nextAction();
    };
    const actionError = () => {
      log.error('device-stepper-content-step1, actionError= %s', currentAction.value);
      actions[currentAction.value].loading = false;
      actions[currentAction.value].done = false;
      actions[currentAction.value].error = true;
    };
    const nextAction = () => {
      currentAction.value++;
      log.error('device-stepper-content-step1, nextAction= %s', currentAction.value);
    };
    const isAllDone = computed(() => {
      let done = true;
      actions.forEach((i) => done = done && i.done);
      return done;
    });
    const scan = () => {
      try {
        btStatus.value = BtStatus.Connecting;
        watchEffect(() => {
          resetActions();
          connect()
          .then((status: BtStatus) => {
            log.debug('device-stepper-content-step1, status=' + BtStatus[status]);
            if (status === BtStatus.Connected) {
              actionDone();
              Promise.all([device().readValue(), current().readValue(), available().readValue()])
              .then((data) => {
              log.info('device-stepper-content-step1.scan: data=' + JSON.stringify(data));
              if (!isDeviceDataValid(data[0]) || !isWiFiDataValid(data[1]) || isWiFiDataArrayValid(data[2])) {
                log.info('Received invalid device state data, disconnects');
                actionError();
                disconnect();
              } else {
                log.info('device-stepper-content-step1: data is valid');
                actionDone();
                // Device data
                deviceState.deviceData.name = data[0].name;
                deviceState.deviceData.deviceID = data[0].deviceID;
                deviceState.deviceData.key = data[0].key;
                // current WiFi
                deviceState.networks.current.ssid = data[1].ssid;
                deviceState.networks.current.security = data[1].security;
                // Available WiFi
                data[2].forEach((network) => deviceState.networks.available.push(reactive(
                  {   ssid: ref(network.ssid),
                      security: ref(network.security),
                  })));
                log.info('device-stepper-content-step1 deviceState= %s', JSON.stringify(deviceState));

                deviceName.value = deviceState.deviceData.name;
                btStatus.value = BtStatus.Connected;
              }
              });
            } else {
              actionError();
              disconnect();
            }
          });

        });
      } catch {
              actionError();
              log.info('No devices found, do something');
              btStatus.value = BtStatus.Disconnected;
      }

      deviceName.value = '';
    };
    const sync = () => {
      if (deviceState.deviceData) {
        const deviceData = deviceState.deviceData;
        const config: DeviceData = {
            name: deviceData.name,
            deviceID: deviceData.deviceID,
            key: deviceData.key,
        };
        device().writeValue(config)
        .then(() => {
            // update icon
         })
        .catch(() => {
            // update icon
        });
      }
    };

    const ready = () => {
      return valid.value && connected();
    };
    const stepBack = () => {
      context.emit('backward', deviceState);
    };
    const nextStep = () => {
      context.emit('forward', deviceState);
    };
    onMounted(() => {
      log.info('device-stepper-content-step1.mounted!');
    });
    onBeforeUpdate(() => {
      log.info('device-stepper-content-step1.onBeforeUpdate!');
    });
    onUnmounted(() => {
     log.info('device-stepper-content-step1.onUnmounted!');
    });
    onActivated(() => {
      log.info('device-stepper-content-step1.onActivated!');
    });

    return { connecting, connected, deviceState, disconnect, disconnecting, disconnected, ready, item, items, scan,
    prependIcon, deviceName, deviceKey, valid, nameRules, stepBack, nextStep, actions, action };
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