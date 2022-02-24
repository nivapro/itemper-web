
<template>
    <div>
        <h1>Välkommen till itemper.io</h1>
        <admin-config-card v-if="development"></admin-config-card>
    </div>
</template>
<script lang='ts'>

// Config
import {config} from '@/config';

// Vue
import { Vue, Component} from 'vue-property-decorator';
import AdminConfigCard from '@/features/admin/admin-config-card.vue';
@Component({components: {
    AdminConfigCard,
}})
export default class HomePage extends Vue {
    public development = config.development;
}
</script>
<style>
</style>