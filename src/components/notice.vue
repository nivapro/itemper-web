 <template>
    <v-container>
      <v-banner v-if="show()" transition="slide-x-transition"
          :sticky="sticky"
          :single-line="singleLine"
          :icon="icon"
          color="gray"
          icon-color="gray"
          :elevation="elevation"
      >
        <span>{{notice.message}}</span>
      </v-banner>
    </v-container>
</template>
<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';


@Component({})
export default class Notice extends Vue {
      public sticky= false;
      public singleLine = true;
      public icon = 'fa-comment';
      public elevation = 4;
      public notice = Vue.$store.notice;

      public show(): boolean {
        return Vue.$store.notice.message !== '';
      }
}

</script>

<style scoped>
.signlog {
    background-color: rgb(37, 122, 233);
    color:snow;
}
</style>