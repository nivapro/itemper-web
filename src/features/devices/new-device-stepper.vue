<template>
    <v-dialog v-model="dialog" persistent max-width="800">
        <v-stepper v-model="step" >
          <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">Connect device</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">Configure device</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 3" step="3">Enable sensors</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <DeviceStepperContentStep1 @cancel="cancel"  @forward="step=2"></DeviceStepperContentStep1>
            <DeviceStepperContentStep2 @cancel="cancel" @backward="step=1" @forward="step=3"></DeviceStepperContentStep2>
            <v-stepper-content step="3">
              <v-card
                class="mb-12"
                color="grey lighten-1"
              >
                  <v-card-title>Network configuration:</v-card-title>
                  <v-card-text v-if="ssid !== ''">
                      <pre>{{ssid}}</pre>
                  </v-card-text>
              </v-card>
              <v-btn text @click="step = 2">Back</v-btn>
              <v-btn color="primary" @click="close">close</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
    </v-dialog>

</template>

<script lang="ts">
import { ref, computed } from '@vue/composition-api';
import { defineComponent } from '@vue/composition-api';
import { useDeviceState } from './use-device-state';
import DeviceStepperContentStep1 from './device-stepper-content-step1.vue';
import DeviceStepperContentStep2 from './device-stepper-content-step2.vue';

export default defineComponent({
  name: 'NewDeviceStepper',
  components: {
     DeviceStepperContentStep1,
     DeviceStepperContentStep2,
     },
  setup() {
    const step = ref(1);
    const { deviceState } = useDeviceState();
    const ssid = computed(() => deviceState.networks.current.ssid);
    const dialog = ref(true);
    const close = () => {
      dialog.value = false;
    };
    const cancel = () => {
      dialog.value = false;
      step.value = 1;
    };
    const stepBack = () => {
        step.value--;
    };
    const nextStep = () => {
      step.value++;
    };
    return { stepBack, nextStep, step, close, deviceState, ssid, cancel, dialog};
  },
});
</script>
