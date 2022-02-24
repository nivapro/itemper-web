<template>
        <device-setting
            :name="settingName"
            :value="setting.ssid"
            :icon="settingIcon"
            :iconColor="settingIconColor"
            :isOn="settingOn"
            extended
        >
            <template v-slot:default>
                <v-switch v-model="settingOn" @change="switchChanged" inset>
                    <template v-slot:label>
                    <span v-if="settingOn">On</span>
                    <span v-else>Off</span>
                    </template>
                </v-switch>
            </template>
            <template v-slot:extended>
                <v-list>
                    <v-list-item v-if="(settingOn && setting.ssid !== '' || selectedNetwork.ssid !== '')">
                        <v-list-item-icon v-if="connecting">
                            <v-icon v-if="selectedNetwork.security === 'Open'">mdi-lock-open-outline</v-icon>
                            <v-icon v-else>mdi-lock-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-icon v-else>
                            <v-icon color="orange" v-if="setting.security === 'Open'">mdi-lock-open-outline</v-icon>
                            <v-icon color="green" v-else>mdi-lock-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                        <v-list-item-title v-if="connecting">{{selectedNetwork.ssid}}</v-list-item-title>
                        <v-list-item-title v-else class="blue--text">{{setting.ssid}}</v-list-item-title>
                        <v-list-item-subtitle v-if="connecting">Connecting...</v-list-item-subtitle>
                        <v-list-item-subtitle v-else>Connected</v-list-item-subtitle>
                        </v-list-item-content>
                            <v-list-item-action>
                                <v-tooltip left color="white black--text">
                                        <template v-slot:activator="{ on, value }">
                                        <v-btn icon 
                                            v-on="on"
                                            :class="{ 'on-hover': value }">
                                        <v-icon >mdi-information-outline</v-icon>
                                        </v-btn>
                                        </template>
                                        {{securityText(setting.security)}}, channel {{setting.channel}}, strength {{setting.quality}} %
                                </v-tooltip>
                            </v-list-item-action>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-subheader v-if="!settingOn">Turn on Wi-Fi and select a network</v-subheader>
                    <v-subheader v-else-if="setting.ssid ===''">Available networks</v-subheader>
                    <v-subheader v-else>Other networks</v-subheader>
                    <v-list-item-group v-if="settingOn" v-model="newSetting" color="primary">
                        <v-virtual-scroll :items="otherNetworks" :item-height="50" height="300">
                        <template v-slot="{ index, item }">
                            <v-list-item @click="selectNetwork(index)">
                            <v-list-item-icon>
                            <v-icon v-if="isSecured(item.security)">mdi-lock-outline</v-icon>
                            <v-icon v-else>mdi-lock-open-outline</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                            <v-list-item-title v-text="item.ssid"></v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-tooltip left color="white black--text">
                                        <template v-slot:activator="{ on, value }">
                                        <v-btn icon 
                                            v-on="on"
                                            :class="{ 'on-hover': value }">
                                        <v-icon >mdi-information-outline</v-icon>
                                        </v-btn>
                                        </template>
                                        {{securityText(item.security)}}, channel {{item.channel}}, strength {{item.quality}} %
                                </v-tooltip>
                            </v-list-item-action>
                        </v-list-item>
                        </template>
                        </v-virtual-scroll>
                    </v-list-item-group>
                </v-list>
                    <v-dialog v-model="dialog" persistent max-width="290">
                    <v-card>
                        <v-card-title class="headline">{{selectedNetwork.ssid}}</v-card-title>
                        <v-card-text>
                            <v-text-field v-if="secured"
                                label="password"
                                v-model="password"
                                prepend-icon="fa-key"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword"
                                :rules="[v => !!v || 'Password is required']"
                                required
                                :loading="connecting"
                            ></v-text-field>
                        </v-card-text>
                        <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="orange" :disabled="connecting" text @click="reset">Cancel</v-btn>
                        <v-btn color="orange" :disabled="connecting" text @click="connectWiFi">Connect</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </template>
        </device-setting>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watchEffect, PropType  } from '@vue/composition-api';
import { log } from '@/services/logger';
import DeviceSetting from './device-setting.vue';
import { WiFiNetwork } from '../devices//device-data';

export default defineComponent({
  name: 'DeviceWiFiSetting',
  components: { DeviceSetting },
  props: {
    value: {
        type: Object as PropType<WiFiNetwork>,
        required: true,
    },
    networks: {
        type: Array as PropType<WiFiNetwork[]>,
        required: true,
    },
    connecting: { type: Boolean, default: false},
    },
  setup(props, context) {
    const dialog =  ref(false);
    const newSetting = ref(-1);
    const selectedNetworkIndex = ref(-1);
    const setting = computed(() => props.value);
    const settingIconColor = computed(() => settingOn.value ? 'green' : 'gray');
    const settingName = ref('WiFi');
    const settingIcon = ref('mdi-wifi');
    const settingOn = ref(false);
    const password = ref('');
    const showPassword = ref(false);
    watchEffect(() => {
        if (!settingOn.value && setting.value.ssid !== '') {
            settingOn.value = true;
        }
    });
    const otherNetworks = computed(() =>  props.networks
                .filter((n: WiFiNetwork) => settingOn.value && n.ssid !== setting.value.ssid)
                .sort((a, b) => b.quality - a.quality));
    const selectedNetwork = computed(() =>  0 <= selectedNetworkIndex.value &&
                                            selectedNetworkIndex.value < otherNetworks.value.length
                                            ? otherNetworks.value[selectedNetworkIndex.value]
                                            : {ssid: '', security: '', quality: 0, channel: 0 });
    const secured = computed (() => selectedNetwork.value.security !== '' &&
                                    selectedNetwork.value.security !== 'Open' );
    const isSecured = (security: string) => {
        return security !== '' && security !== 'Open';
    };
    const switchChanged = (switchedOn: boolean) => {
        context.emit('switch', switchedOn);
    };
    const connectWiFi = () => {
        const ssid = selectedNetwork.value.ssid.slice();
        const payload = { ssid, password: password.value};
        context.emit('connect', payload);
        reset();
    };
    const selectNetwork = (index: number) => {
            selectedNetworkIndex.value = index;
            dialog.value = true;
    };
    const reset = () => {
        selectedNetworkIndex.value = -1;
        dialog.value = false;
        password.value = '';
    };
    const securityText = (security: string) => {
        return isSecured(security) ? security : 'Open network';
    };
    log.debug('device-wifi-setting.setup');
    return {connectWiFi, dialog, isSecured, otherNetworks, reset, newSetting,
            password, secured, securityText, showPassword, selectedNetworkIndex, selectNetwork,
            switchChanged, setting, settingIcon, settingIconColor, settingName, settingOn, selectedNetwork};
  },
});
</script>
<style scoped>
.v-btn {
transition: opacity 0.3s ease-in-out;
}

.v-btn:not(.on-hover) {
opacity: 0.6;
}

</style>>