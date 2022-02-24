<template>
    <v-menu bottom offset-y>
        <template v-slot:activator="{ on }">
            <v-btn  v-on="on" :color="color()" text-color="white" ripple >
                {{levelName()}}
            </v-btn>
        </template>
        <v-list>
            <v-list-item
                @click="onDebug()"
            >
            <v-list-item-title>Debug</v-list-item-title>
            </v-list-item>
            <v-list-item
                @click="onInfo()"
            >
            <v-list-item-title>Info</v-list-item-title>
            </v-list-item>
            <v-list-item
                @click="onError()"
            >
            <v-list-item-title>Error</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
<script lang="ts">
// Models
import { LogLevel } from '@/models/admin';

// Services
import { log } from '@/services/logger';

// Vue
import { Vue, Component } from 'vue-property-decorator';

@Component({components: {}})
export default class AdminLogLevelMenu extends Vue {

    public state = Vue.$store;
    public submitted = false;
    public errorMsg = '';
    public timeout = 5_000;
    public level: LogLevel = LogLevel.error;

    public created(): void {
        log.debug('admin-log-level-menu.created:');
    }
    public levelName(): string {
        log.debug('admin-log-level-menu.levelName: ' + LogLevel[this.state.admin.level]);
        return LogLevel[this.state.admin.level];
    }
    public color() {
        log.debug('admin-log-level-menu.color: level=' + LogLevel[this.state.admin.level]);
        switch (this.state.admin.level) {
            case LogLevel.debug: {
                return 'red';
            }
            case LogLevel.info: {
                return 'orange';
            }
            case LogLevel.error: {
                return 'green';
            }
            case LogLevel.undefined: {
                return 'grey';
            }
        }
    }
    public onDebug() {
            log.debug('admin-log-level-menu.onDebug: level=' + LogLevel[this.level]);
            log.startLogging();
            this.level = LogLevel.debug;
            this.submitLevel(this.level);
    }
    public onInfo() {
            log.debug('admin-log-level-menu.onInfo: level=' + LogLevel[this.level]);
            log.startLogging();
            this.level = LogLevel.info;
            this.submitLevel(this.level);
    }
    public onError() {
            log.debug('admin-log-level-menu.onError: level=' + LogLevel[this.level]);
            log.stopLogging();
            this.level = LogLevel.error;
            this.submitLevel(this.level);
    }
    public submitLevel(newLevel: LogLevel) {
        if (this.state.admin.level === newLevel) {
            log.debug('admin-log-level-menu.submitlevel: no changes');
            return;
        } else {
            log.debug('admin-log-level-menu.submitlevel: updating log level: ' +  LogLevel[newLevel]);
            this.submitted = true;
            this.state.admin.updateLevel(newLevel)
            .then(() => {
                this.level = this.state.admin.level;
                this.submitted = false;
                if (this.level !== LogLevel.error) {
                    this.setLoggingTimeout();
                }
                log.info('admin-log-level-menu.submitlevel: log level updated to'  + LogLevel[this.state.admin.level]);
            })
            .catch((err) => {
                this.submitted = false;
                const msg = 'error (' + err.status + '): ' + err.message;
                this.displayError(msg);
                log.error('admin-log-level-menu.submitlevel: ', msg);
            });
        }
    }
    public isError(): boolean {
        return this.errorMsg !== '';
    }
    private resetLogging(): void {
        this.submitted = true;
        this.state.admin.resetLevel()
        .then(() => {
            this.level = this.state.admin.level;
        })
        .catch((err) => {
            this.submitted = false;
            this.displayError('error (' + err.status + '): ' + err.message);
        });
    }
    private setLoggingTimeout() {
        const timeout = 60_000;
        setTimeout(() => {this.resetLogging(); }, timeout);
    }
    private resetErrorMsg(): void {
        this.errorMsg = '';
    }
    private displayError(msg: string) {
        this.errorMsg = msg;
        this.setErrorMsgTimeout();
    }
    private setErrorMsgTimeout() {
        const timeout = 2_500;
        setTimeout(() => {this.resetErrorMsg(); }, timeout);
    }

}
</script>

<style scoped>
</style>
