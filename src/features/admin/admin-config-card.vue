
<template>
    <div>
        <v-card>
            <v-card-title>Configuration:</v-card-title>
            <v-card-text><pre>{{config}}</pre></v-card-text>
        </v-card>
    </div>
</template>
<script lang='ts'>
import {config} from '@/config';

import { Vue, Component} from 'vue-property-decorator';

@Component({})
export default class ConfigCard extends Vue {
    public config = JSON.stringify(config, undefined, 2);
    public location = JSON.stringify(window.location, undefined, 2);
}
</script>
<style>
</style>