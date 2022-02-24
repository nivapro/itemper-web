<template>
    <v-card
        class="mx-auto"
        outlined
    >
        <v-list-item three-line>
            <v-list-item-content>
                <v-list-item-title class="headline mb-1">
                    Loggnivå: <admin-log-level-menu></admin-log-level-menu>
                </v-list-item-title>
                <v-list-item-subtitle>Anger detaljnivå på tjänsteloggar</v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
        <v-card-actions>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
// Services
import { log } from '@/services/logger';

// Vue
import { Vue, Component } from 'vue-property-decorator';
import AdminLogLevelMenu from './admin-log-level-menu.vue';

@Component({components: {
    AdminLogLevelMenu,
}})
export default class AdminLogLevelCard extends Vue {
    public created(): void {
        log.debug('AdminLogLevelCard.created()');
    }
}
</script>

<style scoped>
</style>
