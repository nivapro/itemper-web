<template>
    <v-row>
        <v-col>
            <user-register-card  @onRegister="register" @onLogin="swap"></user-register-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
// Vue
import { Component, Vue } from 'vue-property-decorator';
import UserRegisterCard from '@/features/user/user-register-card.vue';

// Store
import { Status } from '@/store/user';

// Services & helpers
import { log } from '@/services/logger';
import { router } from '@/router';

@Component({components: {
    UserRegisterCard,
}})
export default class UserRegisterPage extends Vue {
    public store = Vue.$store;
    public returnUrl = '';

    public register(status: Status) {
        this.store.notice.publish('Welcome to itemper!');
        log.debug('Register.register: status=' + Status[status]);
        if (this.returnUrl) {
            router.push(this.returnUrl);
        } else {
            router.push({name: 'locations'});
        }
    }
    public swap() {
        router.push({name: 'login'});
    }
}
</script>

<style>

</style>