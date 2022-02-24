<template>
    <v-card  class="mx-auto mt-5">
        <v-card-title>
            <h3>Login to itemper</h3>
        </v-card-title>
        <v-card-text>
            <v-form v-model="valid" ref="login">
                <v-text-field
                    label="E-mail"
                    prepend-icon="fa-envelope"
                    v-model="email"
                    :rules="emailRules"
                    required
                    clearable
                ></v-text-field>

                <v-text-field
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-icon="fa-lock"
                    @click="showPassword = !showPassword"
                    v-model="password"
                    :rules="passwordRules"
                    required
                    clearable
                ></v-text-field>
            </v-form>
        </v-card-text>


        <v-divider></v-divider>
        <v-card-actions>
            <v-btn @click="submit" :disabled="!valid" :loading="submitted" color="info">Login</v-btn>
            <v-spacer>
                <p v-if="error()"  class="red--text" align="center">{{errorMsg}}</p>
                <p v-else align="center">Register if you don't have an account</p>
            </v-spacer>
            <v-btn @click="swap" :disabled="submitted">Register</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
// Vue
import { Component, Prop, Vue } from 'vue-property-decorator';

// Store
import { Status } from '@/store/user';
// Services & helpers
import {log} from '@/services/logger';
import {json} from '@/helpers';

// Validation types
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;

@Component({
    components: {},
})
export default class UserLoginCard extends Vue {
    public showPassword: boolean = false;
    public store = Vue.$store;
    public cred = Vue.$store.user.credentials;
    public status = Vue.$store.user.status;
    public user = Vue.$store.user;

    public email = '';
    public password = '';
    public valid: boolean =  false;
    public checkbox: boolean = false;
    public select: string = '';

    public submitted: boolean = false;
    public errorMsg = '';
    public timeout: number = 2_000;
    public passwordRules: ValidationFunction[] = [
          (v) => !!v || 'Enter password',
          (v) => v && v.length >= 7 || 'Password must be at least 7 characters',
        ];
    public confirmPasswordRules: ValidationFunction[] = [
          (v) => !!v || 'Please, re-enter password',
          (v) => v && v === this.cred.password || 'Does not match password',
        ];

    public emailRules: ValidationFunction[] = [
          (v) => !!v || 'Enter E-mail address',
          (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Invalid E-mail address',
        ];
    public nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^\w/.test(v) && v.length >= 3 || 'Name must be at least 3 characters',
        ];
    public setEmail(email: string) {
        this.cred.email = email;
    }
    public error(): boolean {
        return this.errorMsg !== '';
    }
    public login(email: string, password: string) {
        log.debug('login-card: login()');
        this.submitted = true;
        this.user.login()
        .then((status: Status) => {
            log.debug('login-card.login, status=' + Status[status]);
            this.submitted = false;
            this.$emit('onLogin', status);
        })
        .catch((error: any) => {
            this.submitted = false;
            this.displayError('(' + error.status + '): ' + error.message );
        });
    }
    public submit() {
        if (!this.valid) {
            this.displayError('Login form not vallid');
            return;
        } else {
            this.login(this.cred.mEmail, this.cred.mPassword);
        }
    }
    public swap() {
        this.$emit('onRegister');
    }
    private reset(): void {
        this.errorMsg = '';
    }
    private displayError(msg: string) {
        this.errorMsg = msg;
        this.setTimer();
    }
    private setTimer() {
        const timeout = 4_000;
        setTimeout(() => {this.reset(); }, timeout);
    }
}
</script>

<style>
</style>