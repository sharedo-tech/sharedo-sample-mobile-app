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
        <v-btn icon @click="$router.push({ name: 'task-comments', params: { id } })">
          <v-badge :value="commentCount > 0" :content="commentCount" color="error lighten-1" offset-x="12" offset-y="14">
            <v-icon>mdi-comment-outline</v-icon>
          </v-badge>
        </v-btn>
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
        <v-btn small icon right color="primary" @click.stop="showTaskDetailForm()"><v-icon>mdi-pencil-outline</v-icon>
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
        <v-btn small icon right color="primary" @click.stop="showTaskDetailForm()"><v-icon>mdi-pencil-outline</v-icon>
        </v-btn>
      </div>
      <div>
        <span><strong>Description:</strong></span>
        <div v-html="description"></div>
      </div>

      <v-expansion-panels flat tile class="mt-5 mb-5 grey-panels" v-model="openedPanel">
        <v-expansion-panel>
          <v-expansion-panel-header class="panel-header">Related documents</v-expansion-panel-header>
          <v-expansion-panel-content id="documents-panel" eager>
            <related-document-list v-if="id" :id="id" :can-edit="canEdit" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </div>
  </v-container>
</template>

<script>
import { CoreUi, SharedoProfile } from "@sharedo/mobile-core";
import TaskDetailForm from "./TaskDetailForm.vue";
import tasksAgent from "./tasksAgent";
import bookmarks from "@/views/Bookmarks/bookmarksAgent";
import comments from "@/views/Comments/commentsAgent";
import phases from "./phaseAgent";

const RelatedDocumentList = () => import("@/views/RelatedDocuments/RelatedDocumentList");

export default {
  components: {
    TaskDetailForm,
    RelatedDocumentList
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
      canProgress: false,
      bookmarkingEnabled: false,
      bookmarked: false,
      commentCount: 0,
      openedPanel: null,
      phases: []
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
    },
    userDrivenPhases: function () {
      return this.phases.filter(phase => phase.isUserDriven);
    }
  },
  mounted: async function () {
    await Promise.all([
      this.loadPermissions(),
      this.loadPhases(),
      this.loadTask(),
      this.loadBookmarkingConfig(),
      this.loadCommentCount()
    ]);
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
    loadCommentCount: async function () {
      try {
        const { totalRows } = await comments.get(this.id, 1, 1);
        this.commentCount = totalRows;
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
    loadPermissions: async function () {
      try {
        const permissions = await tasksAgent.getPermissions(this.id);

        this.canEdit = permissions.includes("core.sharedo.update");
        this.canProgress = permissions.includes("core.sharedo.progress.milestone");
      } catch (error) {
        console.error(error);
      }
    },
    loadPhases: async function () {
      try {
        this.phases = await phases.getFor(this.id);
      } catch (error) {
        console.error(error);
      }
    },
    showActionSheet: function () {
      const self = this;

      const actions = [
        { text: "Actions", type: "header" },
        { text: "Take ownership", color: "primary", icon: "mdi-arrow-left", handler: () => self.takeOwnership() },
      ];

      if (this.userDrivenPhases.length > 0) {
        actions.push({ text: "Progress to", type: "header" });

        this.userDrivenPhases.forEach(phase => {
          const action = {
            text: phase.name,
            color: phase.isOptimumPath ? "primary" : null,
            icon: phase.toPhaseIconClass || "mdi-fast-forward-outline",
            handler: () => self.confirmTransitionTo(phase)
          }

          actions.push(action);
        })
      }

      if (this.bookmarkingEnabled) {
        if (!this.bookmarked) {
          actions.push({ text: "Bookmark", color: "primary", icon: "mdi-star-outline", handler: async () => await self.bookmark(true) });
        } else {
          actions.push({ text: "Remove bookmark", color: "primary", icon: "mdi-star-off-outline", handler: async () => await self.bookmark(false) });
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
      const self = this;
      const loading = self.$coreUi.loading();

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
      this.$coreUi.dialog(TaskDetailForm, {});
    },
    confirmTransitionTo: function (phase) {
      const self = this;

      self.$coreUi.messageBox({
        title: `Progress to ${phase.name}`,
        message: "Are you sure?",
        btns: [
          { text: "Cancel" },
          {
            text: "OK",
            color: "primary",
            handler: async () => {
              await self.transitionTo(phase);
            }
          }
        ]
      });
    },
    transitionTo: async function (phase) {
      try {
        const loading = this.$coreUi.loading();

        await phases.setFor(this.id, phase.toPhaseSystemName);

        loading.dismiss();
        this.$coreUi.toast(`Set to ${phase.name}.`);

        await this.loadTask();
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

