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
        <v-icon v-if="isMatter" @click="showNewTaskForm">
          mdi-plus
        </v-icon>
        <v-icon @click="showActionSheet">
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
import { SharedoProfile } from "@sharedo/mobile-core";
import { tasks, matters, comments, bookmarks, phases, participants } from "@/agents";
import { MATTER, TASK } from "@/constants/workItemTypes";

const NewWorkItem = () => import("@/views/WorkItems/New/WorkItemType");
const EditWorkItem = () => import("./EditWorkItem");
const RelatedDocumentList = () => import("@/views/RelatedDocuments/RelatedDocumentList");

export default {
  components: {
    NewWorkItem,
    EditWorkItem,
    RelatedDocumentList
  },
  props: {
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: false,
      default: TASK
    }
  },
  data: function () {
    return {
      loading: true,
      reference: null,
      title: "hello",
      description: null,
      taskDueDate: "",
      bookmarkingEnabled: false,
      bookmarked: false,
      commentCount: 0,
      openedPanel: null,
      phases: [],
      permissions: [],
      owner: "",          // ODS ID of owner
      actions: null,
      titleIsUserProvided: false,
      referenceIsUserProvided: false
    };
  },
  computed: {
    isMatter: function () {
      return this.type === MATTER
    },
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
    },
    isOwner: function () {
      return SharedoProfile.profile.userId === this.owner;
    },
    canEdit: function () {
      return this.isOwner || this.permissions.includes("core.sharedo.update");
    },
    canProgress: function () {
      return this.isOwner || this.permissions.includes("core.sharedo.progress.milestone");
    },
    canTakeOwnership: function () {
      return !this.isOwner && this.actions && this.actions.canTakeOwnership;
    }
  },
  mounted: async function () {
    await Promise.all([
      this.loadPermissions(),
      this.loadPhases(),
      this.loadWorkItem(),
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
    loadWorkItem: function () {
      if (this.type === TASK) {
        return this.loadTask();
      } else if (this.type === MATTER) {
        return this.loadMatter();
      }
    },
    loadTask: async function () {
      try {
        const task = await tasks.getTask(this.id);

        const parts = await participants.getParticipantsFor(this.id);
        
        this.reference = task.workItem.reference;
        this.title = task.workItem.title;
        this.description = task.workItem.description;
        this.taskDueDate = task.aspectData.task?.dueDateTime;

        this.owner = (parts.find(p => p.participantRoleType === "primary-owner") || {}).odsId;
        
        this.titleIsUserProvided = task.workItem.titleIsUserProvided;
        this.referenceIsUserProvided = task.workItem.referenceIsUserProvided;

        this.loading = false;

        if (this.canTakeOwnership) {

          // Locked - show banner
          this.$coreUi.banner({
            message: "You are not the task owner.",
            btns: [
              { text: "Become owner", color: "primary", handler: this.takeOwnership.bind(this) }
            ],
          })
        }
      } catch (error) {
        console.error(error);
      }
    },
    loadMatter: async function () {
      try {
        const matter = await matters.get(this.id);
        this.reference = matter.workItem.reference;
        this.title = matter.workItem.title;
        this.description = matter.workItem.description;

        this.titleIsUserProvided = matter.workItem.titleIsUserProvided;
        this.referenceIsUserProvided = matter.workItem.referenceIsUserProvided;

        this.loading = false;
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
        this.permissions = await tasks.getPermissions(this.id);
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
    loadActions: async function () {
      try {
        this.actions = await tasks.getActions(this.id);
      } catch (error) {
        console.error(error);
      }
    },
    showNewTaskForm: function () {
      this.$coreUi.dialog(NewWorkItem, { parentId: this.id });
    },
    showActionSheet: function () {
      const self = this;

      const actions = [
        { text: "Actions", type: "header" },
      ];

      if (this.canTakeOwnership) {
        actions.push({ text: "Take ownership", color: "primary", icon: "mdi-arrow-left", handler: () => self.takeOwnership() })
      }

      if (this.canProgress && this.userDrivenPhases.length > 0) {
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
    takeOwnership: async function () {
      try {
        const loading = this.$coreUi.loading();

        await tasks.takeOwnership(this.id);

        this.owner = SharedoProfile.profile.userId;
        loading.dismiss();
      } catch (error) {
        console.error(error);
      }
    },
    showTaskDetailForm: function () {
      const vm = this;

      this.$coreUi.dialog(EditWorkItem, {
        id: vm.id,
        type: vm.type,
        workItem: {
          title: vm.title,
          reference: vm.reference,
          taskDueDate: vm.taskDueDate,
          titleIsUserProvided: vm.titleIsUserProvided,
          referenceIsUserProvided: vm.referenceIsUserProvided
        }
      }, {
        closing: saved => {
          if (saved) {
            vm.loadWorkItem();
          }
        }
      });
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

