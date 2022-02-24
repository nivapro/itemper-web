<template>
    <div>
        <v-chip
        v-bind="$attrs"
        class="ma-2"
        :color="color"
        label
        text-color="white"
        >
            <slot> </slot>
        </v-chip>
    </div>
</template>
<script lang='ts'>

import { defineComponent } from '@vue/composition-api';

export default defineComponent({
    name: 'AppToolbarLabel',
    inheritAttrs: false,
    props: {
    color: {
        type: String,
        default: 'pink',
    }},
});

</script>
<style>
</style>