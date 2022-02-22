 <template>
    <div>
        <v-toolbar
        dark
        tabs
        flat
        color="indigo"
        >
        <v-app-bar-nav-icon v-if="state.user.isLoggedIn()" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>iTemper</v-toolbar-title>
        <v-spacer></v-spacer>

        <template v-slot:extension>
            <v-tabs
            v-model="tabs"
            align-with-title
            >
            <v-tab href="#one">
                Item One
            </v-tab>
            <v-tab href="#two">
                Item Two
            </v-tab>
            <v-tab href="#three">
                Item Three
            </v-tab>
            <v-tabs-slider color="pink"></v-tabs-slider>
            </v-tabs>
        </template>
        </v-toolbar>
        <v-card-text>
            <v-tabs-items v-model="tabs">
                <v-tab-item
                v-for="content in ['one', 'two', 'three']"
                :key="content"
                :value="content"
                >
                <v-card
                    height="200px"
                    flat
                >
                </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card-text>
        <v-fab-transition>
        <v-btn
            :key="activeFab.icon"
            :color="activeFab.color"
            fab
            large
            dark
            bottom
            left
            class="v-btn--example"
        >
            <v-icon>{{ activeFab.icon }}</v-icon>
        </v-btn>
        </v-fab-transition>
        <new-dialogue v-if="state.user.isLoggedIn()"/>
    <div>
</template>
<script lang="ts">
import { ref, computed, defineComponent, onMounted } from '@vue/composition-api';

// Services
import { log } from '@/services/logger';
// Child components

export default defineComponent({
  name: 'DevicesPage',
  components: { },

  setup(props, context) {
    const dialog = ref(false);
    const fab = ref(false);
    const hidden = ref(false);

    const tabs = ref('');
    const activeFab = computed (() => {
        switch (tabs.value) {
          case 'one': return { color: 'success', icon: 'mdi-share-variant' };
          case 'two': return { color: 'red', icon: 'mdi-pencil' };
          case 'three': return { color: 'green', icon: 'mdi-chevron-up' };
          default: return {};
        }
    });

    const closeDialog = () => {
        dialog.value = false;
    };
    log.debug('DevicePage.setup');
    return {fab,  tabs, hidden, closeDialog, dialog };
  },
});
</script>