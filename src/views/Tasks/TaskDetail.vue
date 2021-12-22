<template>
    <v-container>
        <VTopToolbar title="Task" :showBack="true">
            <!-- Override right nav button -->
            <template slot="right">
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
                <v-btn
                    small
                    icon
                    right
                    color="primary"
                    @click.stop="showTaskDetailForm()"
                    ><v-icon>mdi-pencil-outline</v-icon>
                </v-btn>
            </div>

            <h3>
                {{ title }}
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
                <v-btn
                    small
                    icon
                    right
                    color="primary"
                    @click.stop="showTaskDetailForm()"
                    ><v-icon>mdi-pencil-outline</v-icon>
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
import TaskDetailForm from "./TaskDetailForm.vue";
import tasksAgent from "./tasksAgent";

export default {
    components: {
        TaskDetailForm,
    },

    data: function () {
        return {
            loading: true,
            reference: null,
            title: "hello",
            description: null,
            canEdit: false,
        };
    },

    mounted: function (props) {
        var self = this;
        var id = self.$route.params.id;

        tasksAgent.getTask(id).then((task) => {
            self.reference = task.workItem.reference;
            self.title = task.workItem.title;
            self.description = task.workItem.description;
            self.loading = false;

            if (!self.canEdit) {
                
                // Locked - show banner
                this.$coreUi.banner({
                    message: "You cannot edit this item.",
                    btns: [
                        { text: "Become owner", color: "primary", handler: self.takeOwnership.bind(self) }
                    ],
                })
            }
        }).catch(console.error);
    },
    methods: {
        showActionSheet: function () {
            var self = this;

            self.$coreUi.actionSheet({
                items: [
                    { text: "Actions", type: "header" },
                    { text: "Take ownership", color: "primary", icon: "mdi-arrow-left", handler: self.takeOwnership.bind(self) },
                    { text: "Progress to", type: "header" },
                    { text: "Done", color: "primary", icon: "mdi-check", handler: self.confirmTransitionTo.bind(self, "done") },
                    { text: "Remove", color: "error", icon: "mdi-trash-can-outline", handler: function() {} },
                ]
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
                    {text: "Cancel"},
                    {text: "OK", color: "primary", handler: function() { self.transitionTo("done"); }}
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

