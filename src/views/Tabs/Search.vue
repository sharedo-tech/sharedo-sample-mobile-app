<template>
    <v-container>
        
        <VTopToolbar :hideRight="true">
            <template slot="content">
                <v-text-field
                    hide-details
                    solo
                    flat
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search for tasks"
                    background-color="primary darken-1"
                    :clearable="true"
                    :autofocus="true"
                    class="ml-1"
                    spellcheck="false"
                    v-on:focus="overlay = true"
                    v-on:blur="overlay = false"
                ></v-text-field>
            </template>
        </VTopToolbar>

        <v-overlay :z-index="1" :value="overlay" />

        <div class="d-flex" style="margin-top: -9px; margin-left: -6px; ">
            <v-btn
                class="ma-1"
                color="primary"
                plain
                right
            >
                Filter
            </v-btn>

            <v-btn
                class="ma-1"
                color="primary"
                plain
                right
            >
                Sort
            </v-btn>

        </div>
        
        <v-divider class="remove-outer-padding" />
        
    </v-container>
</template>

<script>
export default {
    data: function () {
        return {
            overlay: false,
        };
    },
};
</script>

<style>
.v-toolbar .v-text-field.v-text-field--solo .v-input__control {
    min-height: 40px !important;
}

.remove-outer-padding {
    margin-left: -12px;
    margin-right: -12px;
    max-width: inherit !important;
}
</style>