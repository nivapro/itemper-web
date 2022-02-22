<template>
<div id='app'>
    <v-app>
        <AppToolbar></AppToolbar>
        <v-main>
            <v-container fluid>
                <router-view transition='scale-transition'></router-view>
            </v-container>
        </v-main>
    </v-app>
</div>
</template>

<script lang='ts'>
// Vue
import { Vue, Component } from 'vue-property-decorator';

// Store
import { init } from '@/store/store';
init();

// Components
import AppToolbar from '@/components/app-toolbar.vue';

// Features
import AdminPage from '@/pages/admin-page.vue';
import DevicesPage from '@/pages/devices-page.vue';
import LocationPage from '@/pages/location-page.vue';
import SensorsPage from '@/pages/sensors-page.vue';
import UserLoginPage from '@/pages/user-login-page.vue';
import UserRegisterPage from '@/pages/user-register-page.vue';

@Component( {components: {
        AdminPage,
        DevicesPage,
        LocationPage,
        SensorsPage,
        UserLoginPage,
        UserRegisterPage,
        AppToolbar,
    }})
export default class App extends Vue {

}
</script>

