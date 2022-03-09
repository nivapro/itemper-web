<template>
<div>
    <v-menu bottom offset-y>
        <template v-slot:activator="{ on }">
            <v-fab-transition>
                <v-btn class="mx-2 elevation-2" 
                    v-on="on"
                    fab 
                    absolute
                    small
                    color="blue"
                    bottom
                    left>
                    <v-icon color="white">fa-plus</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>
          <v-list dense nav>
              <v-list-item v-for="item in menuItems" :key="item.title" @click="menuItemClicked(item)">
                  <v-list-item-action>
                      <v-icon :color="item.color">{{item.action}}</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                      <v-list-item-title>{{ item.title }} </v-list-item-title>
                  </v-list-item-content>
              </v-list-item>
          </v-list>
    </v-menu>
    <NewDeviceBluetoothDialog :open="openBluetoothDialog" @close="close"/>
    <NewDeviceManualDialog :open="openManualDialog" @close="close"/>
</div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from '@vue/composition-api';

import NewDeviceBluetoothDialog from './new-device-bluetooth-dialog.vue'
import NewDeviceManualDialog from './new-device-manual-dialog.vue'

interface MenuItem {
    action: string;
    title: string;
    color: string;
    show: boolean;
}

export default defineComponent({
  name: 'NewDeviceMenu',
  components: { NewDeviceBluetoothDialog, NewDeviceManualDialog },
  setup(props, context) {

    const  menuItems = reactive([
      { action: 'fab fa-bluetooth', title: 'Hitta en enhet med Bluetooth',  color: 'blue', show: false},
      { action: 'fa-pen', title: 'Skapa en enhet manuellt',  color: 'blue-grey darken-2', show: false},
    ]);

    const openBluetoothDialog = computed(() => menuItems[0].show);
    const openManualDialog = computed(() => menuItems[1].show);

    const menuItemClicked = (item: MenuItem) => {
      menuItems.forEach((i) => i.show = false);
      item.show = true;
    };

    const close = () => { 
      menuItems.forEach((i) => i.show = false)
      context.emit('close')
    };

    return { close, menuItems, menuItemClicked, openBluetoothDialog, openManualDialog} ;
  },
});
</script>
