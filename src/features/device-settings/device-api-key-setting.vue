<template>
    <device-setting
        name="Shared access key"
        :icon="settingIcon"
        :value=setting
        :isOn="isOn"
        off=''
    >
        <div v-if="isOn">
            <p>
                <span   class="d-inline-block text-truncate" 
                        style="max-width: 400px;">
                <v-btn text icon @click="copy">
                    <v-icon >fa-clone</v-icon>
                </v-btn>
                <span id="deviceKey">{{ setting }}</span>
                </span>
            </p>
            <p class="font-weight-medium"><span>Copy the shared access key by clicking on the icon</span>
            <v-icon >fa-clone</v-icon><span>above.</span></p>
            <error-message :message="errorMsg"/>
        </div>
    </device-setting>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';

import DeviceSetting from './device-setting.vue';
import ErrorMessage from '@/components/error-message.vue';

export type DeviceSettingValue = string | number;
export type validatorFunction = (value: DeviceSettingValue) => boolean;

import {copyToClipboard } from '@/helpers';

const message = '';
export function useErrorMessage() {
    const errorMsg = ref(message);
    const displayError = (msg: string, ms = 2_000) => {
        errorMsg.value = msg;
        setTimeout(() => reset(), ms);
    };
    const reset = (): void => {
        errorMsg.value = '';
    };
    return { errorMsg , displayError };
}
export default defineComponent({
    name: 'DeviceApiKeySetting',
    components: { DeviceSetting, ErrorMessage },
    props: {
            value: {
                type: String,
                required: true,
            },
            loading: { type: Boolean, default: false},
    },
    setup(props) {
        const setting = computed(() => props.value);
        const settingIcon = ref('fa-key');
        const isOn = computed(() => setting.value !== '');

        const { errorMsg, displayError } = useErrorMessage();

        const copy = () => {
            if (!copyToClipboard('deviceKey')) {
                   displayError('Cannot copy key to clipboard');
            }
        };
        return { isOn, setting, settingIcon, errorMsg, copy };
    },
});
</script>
