<template>
    <div>
        <slot>
            <p v-show="showMessage" :class="color" align="center">{{ message }}</p>
        </slot>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { log } from '@/services/logger';
export default defineComponent({
    name: 'ErrorMessage',
    components: {},
    props: {
        message: {
            type: String,
            default: '',
        },
        color: {
            type: String,
            default: 'red--text',
        },
    },
    setup(props) {
        const showMessage = computed(() => props.message !== '');
        log.info('error-message.setup');
        return { showMessage };
    },
});
</script>
