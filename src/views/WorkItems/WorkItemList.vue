<template>
  <v-container style='background: #f1f5f8'>

    <VTopToolbar title="Task list">
      <template v-slot:menu>
        <app-menu />
      </template>
      <!-- Override right nav button -->
      <template slot="right">
        <v-icon v-if="bookmarksEnabled" @click="$router.push({ name: 'bookmarks' })">
          mdi-star-box-outline
        </v-icon>
        <v-icon v-visible="!loading" @click="loadPage(true)">
          mdi-cached
        </v-icon>
      </template>
    </VTopToolbar>

    <div v-show="loading">

      <v-skeleton-loader type="card, card, card"></v-skeleton-loader>

    </div>

    <v-card class="mx-auto mb-3" outlined v-show="!loading" v-for="task in tasks" :key="task.id">
      <div class="d-flex" @click.stop="navigate(task)">
        <div class="flex-grow-1">

          <v-card-title class="align-start flex-nowrap mb-3">
            <div class="flex-grow-0">
              <v-icon left>{{ task.icon }}</v-icon>
            </div>
            <div class="flex-grow-1" style="word-break: break-word;">
              <span class="font-weight-bold blue-grey--text">{{ task.title }}</span>
            </div>
          </v-card-title>

          <v-card-subtitle class="font-weight-bold pb-1">
            {{ task.type }} - {{ task.phase }}
          </v-card-subtitle>

          <v-card-text class="grey--text text--darken-1">
            <div class="text-truncate">{{ task.reference || "No reference" }}</div>
            <div class="text-truncate">
              <v-icon left small style="vertical-align: inherit;">{{ task.primaryOwnerIcon }}</v-icon>
              <span>{{ task.primaryOwner }}</span>
            </div>
          </v-card-text>
        </div>

        <div class="flex-grow-0 d-flex">
          <v-icon large color="grey lighten-2">mdi-chevron-right</v-icon>
        </div>
      </div>
      <v-divider></v-divider>

      <v-card-actions class="my-1">
        <span v-if="isTask" class="card-text-small ml-2 task-lag" v-lag="task.due"></span>
        <v-spacer></v-spacer>
        <v-icon small color="grey" v-if="task.anyDocs" class="mr-2">mdi-paperclip</v-icon>
        <v-icon small color="grey" class="mr-1" @click.stop="showOptions(task)">mdi-dots-horizontal</v-icon>
      </v-card-actions>
    </v-card>

    <v-btn outlined rounded text block color="primary" v-show="!loading && hasMore" :loading="loadingMore"
      @click.stop="loadNextPage()">
      More
    </v-btn>

  </v-container>
</template>


<script>
import { tasks, matters, bookmarks } from "@/agents";
import { TASK, MATTER } from "@/constants/workItemTypes";

const rpp = 20;

export default {
  props: {
    type: {
      type: String,
      required: false,
      default: TASK
    }
  },
  data: function () {
    return {
      loading: true,
      loadingMore: false,
      tasks: [],
      lastPageLoaded: 0,
      hasMore: true,
      bookmarksEnabled: false
    };
  },
  computed: {
    isTask: function () {
      return this.type === TASK;
    }
  },
  watch: {
    type: async function () {
      await this.load();
    }
  },
  methods: {
    load: async function () {
      try {
        var results = await Promise.all([bookmarks.enabled(), this.loadPage(true)]);

        this.bookmarksEnabled = results[0].enabled;
        this.hasMore = results[1].hasMore;
      } catch (error) {
        console.error(error);
      }
    },
    loadPage: async function (refresh) {
      if (refresh) {
        // TODO scroll to top
        // TODO hasMore not working?
        //this.hasMore = false;
        this.lastPageLoaded = 0;
        this.tasks.splice(0, this.tasks.length);
        this.loading = true;
      }

      if (this.type === TASK) {
        return await this.loadTasks();
      } else if (this.type === MATTER) {
        return await this.loadMatters();
      }
    },
    loadItems: async function (loader) {
      try {
        this.lastPageLoaded++;
        const response = await loader();

        this.tasks = response.results.map(t => ({
          id: t.id,
          reference: t.data.reference,
          title: t.data.title,
          description: t.data["description.html"],
          due: new Date(t.data["taskDueDate.date.local.value"]),
          icon: t.data["type.iconClass"],
          type: t.data["type.name"],
          phase: t.data["phase.name"],
          primaryOwner: t.data["roles.primary-owner.ods.name"],
          primaryOwnerIcon: t.data["roles.primary-owner.participantType.iconClass"],
          anyDocs: !!t.data["documents!1.title"],
          link: "/tasks/" + t.id
        }));

        const totalPages = Math.ceil(response.totalCount / rpp);
        this.loading = false;
        return { hasMore: totalPages > this.lastPageLoaded };
      } catch (error) {
        console.error(error);
      }
    },
    loadTasks: async function () {
      return await this.loadItems(() => tasks.getMyTasks(rpp, this.lastPageLoaded));
    },
    loadMatters: async function () {
      return await this.loadItems(() => matters.list(this.lastPageLoaded, rpp));
    },
    loadNextPage: async function () {
      try {
        this.loadingMore = true;

        const result = await this.loadPage();

        this.loadingMore = false;

        if (!result.hasMore) {
          this.hasMore = false;
        }
      } catch (error) {
        console.error(error);
      }
    },
    navigate: function (workItem) {
      if (this.type === TASK) {
        this.$router.push({ name: "task-detail", params: { id: workItem.id } });
      } else if (this.type === MATTER) {
        this.$router.push({ name: "matter-detail", params: { id: workItem.id } });
      }
    },
    showOptions: function (workItem) {
      const vm = this;

      if (this.type === TASK) {
        vm.$coreUi.actionSheet({
          items: [
            { text: "Open", color: "primary", icon: "mdi-arrow-right-circle", handler: () => vm.navTo(workItem) },
          ]
        });
      }
    },
  },
  mounted: async function () {
    await this.load();
  },
};
</script>

<style scoped>
.v-card__title {
  font-size: 1.1rem;
  line-height: 1.5rem;
}

.v-card__title .v-icon.v-icon {
  font-size: 22px;
}

.v-card__text,
.card-text-small {
  font-size: .775rem;
}

/* Purposefully unspecific CSS so red--text overrides us */
.task-lag {
  color: var(--v-secondary-darken1);
}
</style>