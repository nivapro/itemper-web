<template>
    <v-list two-line subheader>
        <v-subheader class="title">Inställningar</v-subheader>
        <v-divider></v-divider>
            <v-list-tile @click="">
                <v-list-tile-content>
                    <v-list-tile-title class="subheading">Temperatur</v-list-tile-title>
                    <v-list-tile-sub-title class="subheading" >
                        Celsius, {{unitSymbol()}}
                    </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-icon :color="'teal'">fa-check-circle</v-icon>
                </v-list-tile-action>
            </v-list-tile>
            <v-list-tile @click="">
                <v-list-tile-content>
                    <v-list-tile-title class="subheading">Larm</v-list-tile-title>
                    <v-list-tile-sub-title class="subheading" >
                        Larma vid {{limit()}} grader
                    </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-icon :color="'teal'">fa-check-circle</v-icon>
                </v-list-tile-action>
            </v-list-tile>
            <v-list-tile @click="">
                <v-list-tile-content>
                    <v-list-tile-title class="subheading">Noggrannhet</v-list-tile-title>
                    <v-list-tile-sub-title class="subheading" >
                        Antal decimaler: {{resolution()}} decimal
                    </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-icon :color="'teal'">fa-check-circle</v-icon>
                </v-list-tile-action>
            </v-list-tile>
            <v-list-tile@click="">
                <v-list-tile-content>
                    <v-list-tile-title class="subheading">Uppdatering</v-list-tile-title>
                    <v-list-tile-sub-title class="subheading" >
                        Hämta ny information efter {{interval()}} sekunder
                    </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-icon :color="'teal'">fa-check-circle</v-icon>
                </v-list-tile-action>
            </v-list-tile>
            <v-list-tile@click="">
                <v-list-tile-content>
                    <v-list-tile-title class="subheading">Tidszon</v-list-tile-title>
                    <v-list-tile-sub-title class="subheading" >
                        {{zone()}}
                    </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-icon :color="'teal'">fa-check-circle</v-icon>
                </v-list-tile-action>
            </v-list-tile>                           
    </v-list>
</template>

<script lang="ts">

// import axios from 'axios';
// import { iTemperAPI } from './../config';
import { Vue, Component } from 'vue-property-decorator';

import { log } from '@/services/logger';

import { Category} from '@/models/sensor-data';

// export interface RootState {
//     settings: Settings.GlobalSettings;
//     locations: Location.LocationState;
//     sensors: Sensors.SensorState;
// }

@Component({})
export default class SettingsPage extends Vue {
    public state = Vue.$store;

    public unitSymbol(): string {
        return this.state.settings.unit(Category.Temperature);
    }
    public limit(): number {
        return this.state.settings.limit;
    }
    public resolution(): number {
        return this.state.settings.resolution;
    }

    public interval(): number {
        return this.state.settings.interval;
    }

    public zone(): string {
        return this.state.settings.zone;
    }

    public created() {
      log.debug('MySettings.created()');
    }
}
</script>

<style>

</style>