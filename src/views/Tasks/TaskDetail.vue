<template>
    <v-container>
        <VTopToolbar title="Task" :showBack="true">
            <template v-slot:menu>
                <app-menu />
            </template>
            <!-- Override right nav button -->
            <template slot="right">
                <v-icon v-if="canViewTime"
                    @click="$router.push({ name: 'task-time-entries', params: { id } })">mdi-clock-outline</v-icon>
                <v-icon @click="showActionSheet()">
                    mdi-dots-horizontal
                </v-icon>
            </template>
        </VTopToolbar>

        <div v-show="loading">
            <v-skeleton-loader type="paragraph"></v-skeleton-loader>
        </div>

        <div v-show="!loading">

            <div class="float-right" v-if="canEdit">
                <v-btn small icon right color="primary"
                    @click.stop="showTaskDetailForm()"><v-icon>mdi-pencil-outline</v-icon>
                </v-btn>
            </div>

            <h3>
                {{ title }}
                <v-icon v-if="bookmarked" small>mdi-star</v-icon>
            </h3>

            <div class="mb-2">
                <span><strong>Reference:</strong></span>
                <div>{{ reference || "[No reference]" }}</div>
            </div>
            <div class="mb-2">
                <span><strong>Title:</strong></span>
                <div>{{ title }}</div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <div class="float-right" v-if="canEdit">
                <v-btn small icon right color="primary"
                    @click.stop="showTaskDetailForm()"><v-icon>mdi-pencil-outline</v-icon>
                </v-btn>
            </div>
            <div>
                <span><strong>Description:</strong></span>
                <div v-html="description"></div>
            </div>

        </div>
    </v-container>
</template>

<script>
import { SharedoProfile } from "@sharedo/mobile-core";
import TaskDetailForm from "./TaskDetailForm.vue";
import tasksAgent from "./tasksAgent";
import bookmarks from "@/views/Bookmarks/bookmarksAgent";

export default {
    components: {
        TaskDetailForm,
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data: function () {
        return {
            loading: true,
            reference: null,
            title: "hello",
            description: null,
            canEdit: false,
            bookmarkingEnabled: false,
            bookmarked: false
        };
    },
    computed: {
        canViewTime: function () {
            return SharedoProfile.profile.globalPermissions.indexOf("core.time.read") !== -1;
        },
        canViewParticipants: function () {
            return SharedoProfile.profile.globalPermissions.includes("core.sharedo.participant.read");
        },
        canViewChronology: function () {
            return SharedoProfile.profile.globalPermissions.includes("core.sharedo.participant.read");
        }
    },
    mounted: async function () {
        await Promise.all([this.loadTask(), this.loadBookmarkingConfig()]);
    },
    methods: {
        loadBookmarkingConfig: async function () {
            try {
                const { enabled } = await bookmarks.enabled();

                if (enabled) {
                    const { bookmarked } = await bookmarks.isBookmarked(this.id);
                    this.bookmarked = bookmarked;
                }

                this.bookmarkingEnabled = enabled;
            } catch (error) {
                console.error(error);
            }
        },
        loadTask: async function () {
            try {
                const task = await tasksAgent.getTask(this.id);

                this.reference = task.workItem.reference;
                this.title = task.workItem.title;
                this.description = task.workItem.description;
                this.loading = false;

                if (!self.canEdit) {

                    // Locked - show banner
                    this.$coreUi.banner({
                        message: "You cannot edit this item.",
                        btns: [
                            { text: "Become owner", color: "primary", handler: this.takeOwnership.bind(this) }
                        ],
                    })
                }
            } catch (error) {
                console.error(error);
            }
        },
        bookmark: async function (bookmark) {
            if (bookmark) {
                await bookmarks.bookmark(this.id);
            } else {
                await bookmarks.removeBookmark(this.id);
            }

            this.bookmarked = bookmark;
        },
        showActionSheet: function () {
            var self = this;

            const actions = [
                { text: "Actions", type: "header" },
                { text: "Take ownership", color: "primary", icon: "mdi-arrow-left", handler: self.takeOwnership.bind(self) },
                { text: "Progress to", type: "header" },
                { text: "Done", color: "primary", icon: "mdi-check", handler: self.confirmTransitionTo.bind(self, "done") },
                { text: "Remove", color: "error", icon: "mdi-trash-can-outline", handler: function () { } },
            ];

            if (this.bookmarkingEnabled) {
                if (!this.bookmarked) {
                    actions.push({ text: "Bookmark", color: "primary", icon: "mdi-star-outline", handler: async () => await this.bookmark(true) });
                } else {
                    actions.push({ text: "Remove bookmark", color: "primary", icon: "mdi-star-off-outline", handler: async () => await this.bookmark(false) });
                }
            }

            if (this.canViewParticipants || this.canViewChronology) {
                actions.push({ text: "Additional Information", type: "header" });
            }

            if (this.canViewParticipants) {
                actions.push({ text: "Participants", icon: "mdi-account-outline", handler: () => self.$router.push({ name: "task-participants", params: { id: self.id } }) });
            }

            if (this.canViewChronology) {
                actions.push({ text: "Chronology", icon: "mdi-flag-outline", handler: () => self.$router.push({ name: "task-chronology", params: { id: self.id } }) });
            }

            self.$coreUi.actionSheet({
                items: actions
            });
        },
        takeOwnership: function () {
            var self = this;
            var loading = self.$coreUi.loading();

            // TODO call API
            setTimeout(
                function () {
                    loading.dismiss();
                    self.canEdit = true;
                    self.$coreUi.toast("You now own this item.");
                },
                500
            );
        },
        showTaskDetailForm: function () {
            var self = this;
            self.$coreUi.dialog(TaskDetailForm, {});
        },
        confirmTransitionTo: function (systemName) {
            var self = this;

            self.$coreUi.messageBox({
                title: "Progress to Done",
                message: "Are you sure?",
                btns: [
                    { text: "Cancel" },
                    { text: "OK", color: "primary", handler: function () { self.transitionTo("done"); } }
                ]
            });
        },
        transitionTo: function (systemName) {
            var self = this;
            var loading = self.$coreUi.loading();

            // TODO call API
            setTimeout(
                function () {
                    loading.dismiss();
                    self.$coreUi.toast("Set to Done");
                    self.$router.back();
                },
                1000
            );
        },
    },
};
</script>

