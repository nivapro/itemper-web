<template>
    <v-card  class="mx-auto mt-5">
        <v-card-title>
            <h3>Register an account</h3>
        </v-card-title>
        <v-card-text>
            <v-form v-model="valid" ref="login">
                <v-text-field 
                    label="First name"
                    v-model="user.mFirstName"
                    :rules="nameRules"
                    required
                    clearable
                ></v-text-field>

                <v-text-field
                    label="Last name"
                    v-model="user.mLastName"
                    :rules="nameRules"
                    required
                    clearable
                ></v-text-field>

                <v-text-field
                    label="E-mail"
                    v-model="cred.email"
                    :rules="emailRules"
                    required
                    clearable
                ></v-text-field>

                <v-text-field
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-icon="fa-lock"
                    @click="showPassword = !showPassword"
                    v-model="cred.password"
                    :rules="passwordRules"
                    required
                    clearable
                ></v-text-field>
                <v-text-field
                    label="Confirm password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-icon="fa-lock"
                    @click="showPassword = !showPassword"
                    v-model="cred.confirmPassword"
                    :rules="confirmPasswordRules"
                    required
                    clearable
                ></v-text-field>
                <v-checkbox
                    label="I agree to iTemper's terms and conditions"
                    v-model="checkbox"
                    :rules="[(v) => !!v || 'You must agree to continue!']"
                    required
                ></v-checkbox>
            </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn @click="submit()" :disabled="!valid" :loading="submitted" color="info">Register</v-btn>
            <v-spacer>
                <p v-if="error()"  class="red--text" align="center">{{errorMsg}}</p>
                <p v-else align="center">Allready have an account? </p>
            </v-spacer>
            <v-btn @click="swap" :disabled="submitted">Login</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
// Vue
import { Component, Prop, Vue } from 'vue-property-decorator';

// Store
import * as itemper from '@/services/itemper';
import { store } from '@/store/store';
import { Status } from '@/store/user';

// Services & helpers
import {log} from '@/services/logger';
import {json} from '@/helpers';

// Field validation types
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;

@Component({})
export default class UserRegisterCard extends Vue {
    public showPassword: boolean = false;

    public cred = Vue.$store.user.credentials;
    public status = Vue.$store.user.status;
    public user = Vue.$store.user;

    public valid: boolean =  false;
    public checkbox: boolean = false;
    public select: string = '';
    public submitted: boolean = false;

    public errorMsg = '';

    public passwordRules: ValidationFunction[] = [
          (v) => !!v || 'Enter password',
          (v) => v && v.length >= 7 || 'Password must be at least 7 characters',
        ];
    public confirmPasswordRules: ValidationFunction[] = [
          (v) => !!v || 'Please, re-ener password',
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
    public register() {
        this.submitted = true;
        this.user.register()
        .then((status: Status) => {
            this.submitted = false;
            this.$emit('onRegister', status);
        })
        .catch((error) => {
            this.submitted = false;
            this.displayError('Cannot register: (' + error.status + '): ' + error.message );
        });
    }
    public submit() {
        if (!this.valid) {
            this.displayError('Register form not vallid, please enter all information');
            return;
        } else {
            this.submitted = true;
            this.register();
        }
    }
    public swap() {
        this.$emit('onLogin');
    }
    private reset(): void {
        this.errorMsg = '';
    }
    private displayError(msg: string) {
        this.errorMsg = msg;
        this.setTimer();
    }
    private setTimer() {
        const timeout = 3_500;
        setTimeout(() => {this.reset(); }, timeout);
    }
}
</script>

<style>
</style>