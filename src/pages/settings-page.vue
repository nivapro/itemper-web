<template>
    <v-row>
        <v-col>
            <v-list two-line subheader>
                <v-subheader class="title">Inställningar</v-subheader>
                <v-divider></v-divider>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subheading">Temperatur</v-list-item-title>
                            <v-list-item-subtitle class="subheading" >
                                Celsius, {{unitSymbol}}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon :color="'teal'">fa-check-circle</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subheading">Larm</v-list-item-title>
                            <v-list-item-subtitle class="subheading" >
                                Larma vid {{settings.limit}} grader
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon :color="'teal'">fa-check-circle</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subheading">Noggrannhet</v-list-item-title>
                            <v-list-item-subtitle class="subheading" >
                                Antal decimaler: {{settings.resolution}} decimal
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon :color="'teal'">fa-check-circle</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subheading">Uppdatering</v-list-item-title>
                            <v-list-item-subtitle class="subheading" >
                                Hämta ny information efter {{settings.interval}} sekunder
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon :color="'teal'">fa-check-circle</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subheading">Tidszon</v-list-item-title>
                            <v-list-item-subtitle class="subheading" >
                                {{settings.zone}}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon :color="'teal'">fa-check-circle</v-icon>
                        </v-list-item-action>
                    </v-list-item>                           
            </v-list>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import { computed, defineComponent } from '@vue/composition-api';
import { Category} from '@/models/sensor-data';

export default defineComponent({
    name: 'SettingsPage',
    components: {},

    setup() {
        const settings = Vue.$store.settings;
        const unitSymbol = computed(() => {
            return settings.unit(Category.Temperature)
        })

    return { settings, unitSymbol }
  }
});
</script>
<style>
</style>