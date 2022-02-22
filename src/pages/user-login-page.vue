<template>
<div height="1500">
    <user-login-card @onLogin="login" @onRegister="swap"></user-login-card>
</div>
</template>

<script lang="ts">
// Vue
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserLoginCard from '@/features/user/user-login-card.vue';
import Notice from '@/components/notice.vue';

// Store
import { Status } from '@/store/user';

// Services & helpers
import {log} from '@/services/logger';
import { router } from '@/helpers';

@Component({
    components: {
        Notice,
        UserLoginCard,
    },
})
export default class UserLoginPage extends Vue {
    public store = Vue.$store;
    public returnUrl = '/';

    public login(status: Status) {
        this.store.notice.publish('Welcome to itemper!');
        log.debug('Login.login: status=' + Status[status]);
        if (this.returnUrl) {
            router.push(this.returnUrl);
        } else {
            router.push({name: 'locations'});
        }
    }
    public swap() {
        router.push({name: 'register'});
    }
}
</script>

<style>
</style>