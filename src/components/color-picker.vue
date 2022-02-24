 <template>
    <v-color-picker
        hide-canvas
        hide-inputs
        hide-mode-switch
        show-swatches
        :swatches="swatches" 
        class="mx-auto"
        v-bind:value="value"
        v-on:input="onInput"
        v-bind="$attrs"
    ></v-color-picker>
</template>
<script lang="ts">
import { defineComponent, ref} from '@vue/composition-api';
import { log } from '@/services/logger';

export default defineComponent({
    name: 'ColorPicker',
    components: {},
    inheritAttrs: false,
    props: ['value', 'readonly'],
    setup(props, context) {
        const swatches =  ref([
            ['#e39900', '#990ae3', '#990000'],
            ['#0a99e3', '#000a99', '#00e31e'],
            ['#00FF00', '#00AA00', '#005500'],
            ['#00FFFF', '#00AAAA', '#005555'],
            ['#0000FF', '#0000AA', '#000055'],
        ]);
        const onInput = (event: string) => {
            log.debug('ColorPicker.onInput ' + JSON.stringify(event));
            context.emit('input', event);
        };
        log.debug('ColorPicker.setup');
        return { onInput, swatches };
    },
});
</script>