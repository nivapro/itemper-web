<template>
    <device-setting
        :name="settingName"
        :value="setting"
        :icon="settingIcon"
        :iconColor="settingIconColor"
        :isOn="settingOn"
        @change="onChange"
        off=''
    >
        <v-form v-model="settingValid" ref="form">
        <base-text-field
            :label="settingLabel"
            :loading="loading"
            v-model="newSetting"
            :rules="nameRules"
            @updated="syncSetting"
        ></base-text-field>
            </v-form>
    </device-setting>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { log } from '@/services/logger';
import DeviceSetting from './device-setting.vue';
import BaseTextField from '@/components/base-text-field.vue';
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;

export default defineComponent({
  name: 'DeviceNameSetting',
  components: {BaseTextField, DeviceSetting},
  props: {
        value: {
            type: String,
            required: true,
        },
        loading: { type: Boolean, default: false},
  },
  setup(props, context) {
    const open = ref(false);
    const syncingSetting = ref(false);
    const setting = computed(() => props.value);
    const newSetting = ref('');
    const settingIcon = ref('mdi-alpha-n-circle');
    const settingName = ref('Name');
    const settingOffValue = ref('');
    const settingLabel = ref('Enter a device name');
    const settingIconColor = computed(() => 'primary');
    const settingOn = computed(() => setting.value !== '');
    const settingValid = ref(false);
    const nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^[a-zA-Z0-9-]+$/.test(v) && !!v && v.length >= 4  || 'Must be at least 4-32 characters, alphanumeric and hyphen characters allowed',
        ];
    const syncSetting = () => {
        // if (setting.value !== newSetting.value) {
            // open.value = false;
            context.emit('input', newSetting.value);
            context.emit('close');
        // }
    };
    const onChange = () => {
        open.value = !open.value;
        if (open.value) {
            newSetting.value = setting.value;
        }
    };
    log.debug('device-name-setting.setup');
    return { nameRules, onChange, open, setting, newSetting, settingIcon, settingName, settingOffValue,
            settingLabel, settingIconColor, settingOn, settingValid,
            syncingSetting, syncSetting };
  },
});
</script>
