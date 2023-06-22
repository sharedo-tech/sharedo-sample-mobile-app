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

                    <v-btn :to="{ name: 'matters' }">
                        <span>Work Items</span>
                        <v-icon>mdi-rocket-launch</v-icon>
                    </v-btn>

                    <v-btn class="primary-action" @click.stop="showNewTaskForm()">
                        <span>New Task</span>
                        <v-icon>mdi-plus-circle-outline</v-icon>
                    </v-btn>

                    <v-btn :to="{ name: 'notifications' }">
                        <span>Notifications</span>
                        <v-badge :value="unreadNotifications > 0" :content="unreadNotifications" color="error lighten-1"
                            offset-x="12" offset-y="14">
                            <v-icon>mdi-bell-outline</v-icon>
                        </v-badge>
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
import { mapState, mapActions } from "vuex";
import TaskDetailForm from "./Tasks/TaskDetailForm.vue";
import { InstallPrompt, SharedoProfile } from '@sharedo/mobile-core';
import serviceWorkerBridge from "@/mixins/serviceWorkerBridge";
import notifications from "@/views/Notifications/notificationsAgent";

export default {
    name: "Main",

    mixins: [serviceWorkerBridge],

    components: {
        TaskDetailForm,
    },

    data: function () {
        return {
        };
    },

    computed: {
        ...mapState({
            unreadNotifications: state => state.notifications.unread,
        }),
    },

    mounted: async function () {
        InstallPrompt.init();
        await this.getNotificationCount();
    },

    methods: {
        ...mapActions({
            setUnreadNotifications: "setUnreadNotifications",
        }),
        async getNotificationCount() {
            try {
                const notificationsResponse = await notifications.getFor(SharedoProfile.profile.userId);

                this.setUnreadNotifications(notificationsResponse.numberOfNewItems);
            } catch (error) {
                console.error(error);
            }
        },
        showNewTaskForm: function () {
            var self = this;
            self.$coreUi.dialog(TaskDetailForm, { title: "New task" });
        },
    },
};
</script>