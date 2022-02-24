<template>
    <v-dialog v-model="value" persistent max-width="500">
        <v-card>
            <v-card-title class="headline">New Device</v-card-title>
            <v-card-text>
                <p>Create an access key for device:</p>
                <v-form v-model="valid" ref="device">
                    <BaseTextField
                        label="Device name"
                        prepend-icon="fa-broadcast-tower"
                        v-text="name"
                        readonly
                        :loading="submitted"
                    />
                    <div v-if="deviceKey !== ''">
                    <p>
                        <span   class="d-inline-block text-truncate" 
                                style="max-width: 400px;">
                        <v-btn text icon @click="copy">
                            <v-icon >fa-clone</v-icon>
                        </v-btn>
                        <span id="deviceKey">{{ deviceKey }}</span>
                        </span>
                    </p>
                    <p class="font-weight-medium"><span>Copy the shared access key by clicking on the icon</span>
                    <v-icon >fa-clone</v-icon><span>above.</span></p>
                    </div>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <p v-if="error()"  class="red--text" align="center">{{errorMsg}}</p>
                <p v-else></p>
                <v-spacer></v-spacer>
                <v-btn text v-if="deviceKey === ''" color="orange" :disabled="!valid" :loading="submitted"  @click="submit">Create device</v-btn>
                <v-btn text v-if="deviceKey === ''"  @click="close">Cancel</v-btn>
                <v-btn text v-if="deviceKey !== ''"  @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">

import {Vue} from 'vue-property-decorator';

// Models
// import * as locations from '@/models/locations'
import { Device } from '@/features/devices';

import { log } from '@/services/logger';
import { copyToClipboard } from '@/helpers';

import { defineComponent, ref } from '@vue/composition-api';
import BaseTextField from '@/components/base-text-field.vue';

export default defineComponent({
    name: 'CreateDeviceDialog',
    components: { BaseTextField },
    inheritAttrs: false,
    props: {
        name: { type: String, required: true },
        color: { type: String, required: true },
    },
    setup(props, context) {
        const deviceKey = ref('');
        const valid =  ref(false);
        const value = false;
        const submitted = ref(false);
        const errorMsg = ref('');
        const submit = () => {
            if (!valid) {
                displayError('Device form not valid');
                return;
            } else {
                createDevice(props.name, props.color);
            }
        };
        const close = () => {
            context.emit('input', false);
        };
        const error = (): boolean => {
            return errorMsg.value !== '';
        };
        const createDevice = (name: string, color: string) => {
            log.debug('device-api-key-dialogue.createDevice');
            submitted.value = true;
            Vue.$store.devices.createDevice(name, color)
            .then((device: Device) => {
                submitted.value = false;
                deviceKey.value = device.key;
                Vue.$store.notice.publish('Device ' + name + ' created');
                context.emit('created', device);
                close();
            })
            .catch((err) => {
                submitted.value = false;
                displayError('Something went wrong: (' + err.status + '): ' + err.message );
            });
        };
        const reset = (): void => {
            errorMsg.value = '';
        };
        const displayError = (msg: string) => {
            errorMsg.value = msg;
            setTimer();
        };
        const setTimer = () => {
            const timeout = 1_250;
            setTimeout(() => {reset(); }, timeout);
        };
        const copy = () => {
            if (!copyToClipboard('deviceKey')) {
                    displayError('Error: Cannot copy key to clipboard');
            }
        };
        return {
            submitted,
            copy,
            deviceKey,
            error,
            errorMsg,
            valid,
            submit,
            close,
            value
        };
    },
});


</script>

<style scoped>

.overlay-0 {
    background-color: rgba(227, 153, 0, 0.7);
}

.overlay-1 {
    background-color: rgba(153, 10, 227, 0.7);
}

.overlay-2 {
    background-color: rgba(153, 0, 0, 0.7);
}

.overlay-3 {
    background-color: rgba(10, 153, 227, 0.7);
}

.overlay-4 {
    background-color: rgba(0, 10, 153, 0.7);
}

.overlay-5 {
    background-color: rgba(0, 227, 30, 0.7);
}

.highcharts-background {
    background-color: rgba(255, 255, 255, 0.1);
}

</style>