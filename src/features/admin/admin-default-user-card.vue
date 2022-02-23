<template>
            <v-card
            class="mb-12"
            >
                <v-card-text>
                    <base-text-field
                        :readonly="!edit"
                        :label="label"
                        :loading="loading"
                        v-model="name"
                        :rules="nameRules"
                        @updated="update"
                    ></base-text-field>
                </v-card-text>
                <v-card-actions>
                </v-card-actions>
            </v-card>
</template>
<script lang="ts">
import { ref, defineComponent} from '@vue/composition-api';
import { log } from '@/services/logger';
import BaseTextField from '@/components/base-text-field.vue';
type BooleanOrString = boolean | string;
type ValidationFunction = (value: string) => BooleanOrString;

export default defineComponent({
    name: 'AdminDefaultUserCard',
    components: {
        BaseTextField,
    },

    setup(props, context) {
        const label = ref('Enter a device name');
        const loading = ref(false);
        const edit = ref (true);
        const nameRules: ValidationFunction[] = [
          (v) => !!v || 'Enter name',
          (v) => /^[a-zA-Z0-9\-]+$/.test(v) && !!v && v.length >= 4  || 'Must be at least 4-32 characters, alphanumeric and hyphen characters allowed',
        ];

        const update = () => {
            return;
        };
        return {label,  loading, edit, nameRules };
  },
});
</script>
<style>
</style>