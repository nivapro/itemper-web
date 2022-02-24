 <template>
    <div>
        <v-text-field v-if="!showEdit"  class="headline"
            prepend-inner-icon="fa-edit"
            v-bind="$attrs"
            dense
            required
            v-bind:value="value"
            @focus="onEdit"
        ></v-text-field>                
        <v-text-field v-else class="headline"
            v-bind:value="value"
            v-on:input="onInput"
            prepend-inner-icon="fa-edit"
            v-bind="$attrs"
            dense
            required
            append-icon="fa-check"
            append-outer-icon="fa-times"
            @click:append="onClickAppend"
            @click:append-outer="eraseValue"
        ></v-text-field>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from '@vue/composition-api';
import { log } from '@/services/logger';

export default defineComponent({
    name: 'BaseTextField',
    components: {},
    inheritAttrs: false,
    props: ['value', 'readonly'],
    setup(props, context) {
        const edit = ref(false);
        let cached = {};
        const data = ref('');
        const onEdit = () => {
            if (!props.readonly) {
            log.debug('Base-text-field: onEdit');
            edit.value = true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            cached = Object.assign({}, props.value);
            }
        };
        const showEdit = computed(() => edit.value && !props.readonly );
        watchEffect(() => {
            if (props.readonly) {
                log.debug('base-text-field: watchEffect');
                edit.value = false;
            }
        });
        const eraseValue = () => {
            onInput('');
        };
        const onInput = (event: string) => {
            log.debug('base-test-field.onInput ' + JSON.stringify(event));
            context.emit('input', event);
        };
        const onClickAppend = () => {
            edit.value = false;
            context.emit('updated');
        };
        log.debug('base-text-field.setup');
        return {showEdit, edit, onEdit, eraseValue, onInput, onClickAppend, data };
    },
});
</script>