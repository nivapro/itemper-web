<template>
    <device-setting
        :name="settingName"
        :value="setting"
        :icon="settingIcon"
        :iconColor="settingIconColor"
        :isOn="settingOn"
        @change="onChange"
        >
        <template v-slot:header>
            <span v-if="settingOn">
            <v-btn icon left small :color="setting" :loading="loading">
                <v-icon>fa-square</v-icon>
                </v-btn>
                {{setting}}
            </span>
            <span v-else v-text="settingOffValue"/>
        </template>
        <template v-slot:default>
            <color-picker v-model="newSetting" :readonly="!open"/>
        </template>
    </device-setting>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import { log } from '@/services/logger';
import DeviceSetting from './device-setting.vue';
import ColorPicker from '@/components/color-picker.vue';


export default defineComponent({
  name: 'DeviceColorSetting',
  components: { ColorPicker, DeviceSetting },
  props: {
        value: {
            type: String,
            required: true,
        },
        loading: { type: Boolean, default: false},
  },
  setup(props, context) {
    const open = ref(false);
    const setting = computed(() => props.value);
    const newSetting = ref('');
    const settingIcon = ref('fa-tint');
    const settingName = ref('Color');
    const settingOffValue = ref('');
    const settingLabel = ref('Choose a color');
    const settingIconColor = computed(() => 'orange');
    const settingOn = computed(() => setting.value !== '');
    const syncSetting = () => {
        if (setting.value !== newSetting.value) {
            context.emit('input', newSetting.value);
        }
    };
    const onChange = () => {
        open.value = !open.value;
        if (open.value) {
            newSetting.value = setting.value;
        } else {
            syncSetting();
        }
    };
    log.debug('device-color-setting.setup');
    return { onChange, open, setting, newSetting, settingIcon, settingName, settingOffValue,
            settingLabel, settingIconColor, settingOn };
  },
});
</script>
