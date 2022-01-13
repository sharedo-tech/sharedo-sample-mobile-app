<template>
    <v-card>
        <v-toolbar flat outlined>
            <v-icon @click="close()">mdi-close</v-icon>

            <v-spacer />

            <v-toolbar-title>{{title || "Edit"}}</v-toolbar-title>

            <v-spacer />
            
            <v-btn @click="save()" small text>Save</v-btn>
        </v-toolbar>

        <!-- <v-card-title>
        </v-card-title>-->

        <v-card-text>
            <v-container>
                <v-row>
                    <v-text-field
                        label="Reference"
                        v-model="reference"
                        required
                    ></v-text-field>
                </v-row>
                <v-row>
                    <v-text-field
                        label="Title"
                        v-model="title"
                        required
                    ></v-text-field>
                </v-row>
                <v-row>
                    <v-text-field
                        label="Due"
                        required
                        placeholder="dd/mm/yyyy"
                    ></v-text-field>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: {
        reference: String,
        title: String,
    },
    data: function () {
        return {
        };
    },
    methods: {
        save: function() {
            var self = this;

            // TODO save
            var l = this.$coreUi.loading();
            setTimeout(function() {
                l.dismiss();
                self.close("my-result");
            }, 1000)
        },
        close: function(result) {
            this.$emit("close", result);
        }
    },
};
</script>

<style scoped>
</style>