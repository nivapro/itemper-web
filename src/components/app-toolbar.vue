<template>
    <div>
        <v-navigation-drawer 
            v-if="state.user.isLoggedIn()"
            transition="scale-transition" 
            nudge-left=16 nudge-top=5 
            v-model="drawer"
            app
        >
            <v-list dense nav>
                <v-list-item v-for="item in menuItems" :key="item.title" @click="menuItemClicked(item)">
                    <v-list-item-action>
                        <v-icon :color="item.color">{{item.action}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ item.title }} </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar
            app
            color="indigo"
            dark
        >
            <v-app-bar-nav-icon v-if="state.user.isLoggedIn()" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>iTemper</v-toolbar-title>
            <admin-node-env-label v-if="development"/>
            <app-toolbar-label color="green">{{activityStatus}}</app-toolbar-label>
            <v-spacer></v-spacer>
            <v-btn  v-if="state.user.isLoggedOut()" outlined class="signlog" @click="signup">Sign up</v-btn>
            <v-btn  v-if="state.user.isLoggedOut()" transition="scale-transition" outlined class="signlog" @click="login">Login</v-btn>
            <v-chip ripple
                v-if="state.user.isLoggedIn()"
                transition="scale-transition"
                color="#2591E9"
                class="signlog"
                close
                 @click:close="logout">
                    <v-icon>fa-user</v-icon>
                    {{state.user.credentials.mEmail}}
            </v-chip>
            <template v-if="state.user.isLoggedIn()" v-slot:extension>
                <v-tabs v-model="tabs" align-with-title>
                <v-tab v-for="tab in tabItems" :key="tab.title" @click="menuItemClicked(tab)">
                   {{ tab.title }}
                </v-tab>
                <v-tabs-slider color="pink"></v-tabs-slider>
                </v-tabs>
            </template>
        </v-app-bar>
    </div>
</template>
<script lang="ts">
import {config} from '@/config';
import { computed, defineComponent, ref, watch } from '@vue/composition-api';
import { router, isPublicPath } from '@/router';
import { log } from '@/services/logger';

import { Status } from '@/store/user';
import { useState } from '@/store/store';

import AdminNodeEnvLabel from '@/features/admin/admin-node-env-label.vue';
import AppToolbarLabel from '@/components/app-toolbar-label.vue';


interface MenuItem {
    action: string;
    title: string;
    color: string;
    route: string;
}

export default defineComponent({
    name: 'AppToolbar',
    components: {
            AdminNodeEnvLabel,
            AppToolbarLabel,
        },

    setup(props, context) {
        const { state, startRetrieveState, stopRetrieveState, retrieving, resetState } = useState('toolbar');
        const development = config.development;
        const drawer = ref(false);
        const tabs = ref(-1);
        const  menuItems = [
            { action: 'fa-home', title: 'Hem',  color: 'blue-grey darken-2', route: 'home' },
            { action: 'fa-home', title: 'Platser',  color: 'blue-grey darken-2', route: 'locations' },
            { action: 'fa-hockey-puck', title: 'Enheter',  color: 'blue-grey darken-2', route: 'devices' },
            { action: 'fa-wifi', title: 'Givare',  color: 'blue-grey darken-2', route: 'sensors' },
            { action: 'fa-cog', title: 'Inställningar', color: 'blue-grey darken-2', route: 'settings' },
            { action: 'fa-hammer', title: 'System', color: 'blue-grey darken-2', route: 'admin' },
            { action: 'fa-sign-out-alt', title: 'Logout', color: 'blue darken-2', route: 'logout'},
        ];

        const tabItems = computed(() => menuItems.slice(0, 4));

        const name = computed(() => state.user.credentials.mEmail);

        const menuItemClicked = (item: MenuItem) => {
            if (item.route === 'logout') {
                logout();
            } else {
                router.push({name: item.route});
            }
        };
        const userStatus = computed(() => Status[state.user.status].replace('_', ' ').toLocaleLowerCase());
        const activityStatus = computed(() => retrieving.value ? 'online' : 'offline' );
        watch([retrieving, () => state.user.status], ([retrievingValue, userStatusValue]) => {
            if (userStatusValue === Status.LOGGED_IN && !retrievingValue) {
                log.info('app-toolbar: startRetrieveState');
                startRetrieveState();
            } else if (retrievingValue) {
                log.info('app-toolbar: stopRetrieveState');
                stopRetrieveState();
            }
        })
        const signup = () => {
            state.user.status =  Status.LOGGING_IN;
            router.push({name: 'register'});
        };
        const login = () => {
            state.user.status =  Status.LOGGING_IN;
            router.push({name: 'login'});
        };
        const logout = () => {
            log.debug('Toolbar.logout()' );
            state.user.logout().then(() => {
                stopRetrieveState();
                resetState();
                });
            router.push({name: 'home'});
        };

        router.beforeEach((to, from, next) => {
            log.info('app-toolbar: beforeEach' + context.root.$router.currentRoute.path);
            log.info('app-toolbar: isPublicPath: ' + isPublicPath(to.path));
            log.info('app-toolbar: retrievingState: ' + JSON.stringify(retrieving.value));
            log.info('app-toolbar: state.user.status: ' + Status[state.user.status]);

            next();
        });
        const showFab = computed(() => tabs.value === 1 || tabs.value === 2);
        const activeFab = computed (() => {
            switch (tabs.value) {
            case 1 : return { color: 'red', icon: 'fa-plus' };
            case 2 : return { color: 'blue', icon: 'fa-plus' };
            default: return { };
            }
        });
        return  {
                    activeFab, activityStatus, development, drawer, login, logout, menuItemClicked, menuItems, name,
                    state, signup, showFab, tabs, tabItems, userStatus
                };
    },
});
</script>
<style scoped>
.signlog {
    background-color: rgb(37, 122, 233);
    color:snow;
}
</style>
