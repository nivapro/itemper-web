<template>
<div >
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <v-flex>
                <admin-log-level-card></admin-log-level-card>
                <admin-config-card></admin-config-card>
            </v-flex>
        </v-layout>
    </v-container>
</div>
</template>
<script lang="ts">

// Services
import { log } from '@/services/logger';

// Vue
import { Vue, Component } from 'vue-property-decorator';
import AdminConfigCard from '../features/admin/admin-config-card.vue';
import AdminLogLevelCard from '../features/admin/admin-log-level-card.vue';

@Component({components: {
    AdminConfigCard,
    AdminLogLevelCard,
}})
export default class Admin extends Vue {
    public state = Vue.$store;
    public errorMsg = '';

    public created(): void {
        log.debug('Admin.created()');
    }
    public isError(): boolean {
        return this.errorMsg !== '';
    }
    private resetErrorMsg(): void {
        this.errorMsg = '';
    }
    private displayError(msg: string) {
        this.errorMsg = msg;
        this.setErrorMsgTimeout();
    }
    private setErrorMsgTimeout() {
        const timeout = 3_500;
        setTimeout(() => {this.resetErrorMsg(); }, timeout);
    }
}

</script>

<style scoped>
</style>
