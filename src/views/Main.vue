<template>
    <v-app>

        <v-main class="has-bottom-nav">
            <router-view></router-view>

            <VBottomNav>

                <template slot="contents">                
                    <v-btn :to="{ path: '/tasks' }">
                        <span>Tasks</span>
                        <v-icon>mdi-checkbox-multiple-marked-circle-outline</v-icon>
                    </v-btn>

                    <v-btn class="primary-action" @click.stop="showNewTaskForm()">
                        <span>New Task</span>
                        <v-icon>mdi-plus-circle-outline</v-icon>
                    </v-btn>

                    <v-btn :to="{ name: 'search' }">
                        <span>Search</span>
                        <v-icon>mdi-magnify</v-icon>
                    </v-btn>
                </template>

            </VBottomNav>
        </v-main>
    </v-app>
</template>

<script>
import TaskDetailForm from "./Tasks/TaskDetailForm.vue";
import installPrompt from "../scripts/installPrompt.js";

export default {
    name: "Main",

    components: {
        TaskDetailForm,
    },

    data: function () {
        return {
        };
    },

    mounted: function() {
        installPrompt.init();
    },

    methods: {

        showNewTaskForm: function () {
            var self = this;
            self.$coreUi.dialog(TaskDetailForm, { title: "New task" });
        },
    },
};
</script>
