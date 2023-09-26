<template>
  <v-container>
    <VTopToolbar :hideRight="true">
      <template slot="content">
        <v-text-field id="search-field" v-model="query" hide-details solo flat prepend-inner-icon="mdi-magnify"
          placeholder="Search for tasks" background-color="primary darken-1" :clearable="true" :autofocus="true"
          class="ml-1" spellcheck="false" v-on:focus="overlay = true" v-on:blur="overlay = false" @change="searchChanged"
          @click:clear="reset"></v-text-field>
      </template>
    </VTopToolbar>
    <v-overlay :z-index="1" :value="overlay" />
    <div class="d-flex" style="margin-top: -9px; margin-left: -6px">
      <v-btn class="ma-1" color="primary" plain right @click="toggleSort">
        Sort
      </v-btn>
    </div>
    <v-card class="mx-auto mb-3" outlined v-if="showSort">
      <v-card-title class="align-start flex-nowrap mb-3">
        Sort
      </v-card-title>
      <div class="px-3">
        <v-radio-group v-model="sortBy">
          <v-radio value="relevance" label="Default (relevance)" />
          <v-radio value="title" label="Title" />
          <v-radio value="reference" label="Reference" />
          <v-radio value="dueDate" label="Due Date" />
        </v-radio-group>
        <v-divider class="remove-outer-padding" />
        <v-radio-group v-model="sortDirection">
          <v-radio value="ascending" label="Ascending" />
          <v-radio value="descending" label="Descending" />
        </v-radio-group>
      </div>
    </v-card>
    <v-divider class="remove-outer-padding" />
    <div v-if="resultCount === 0">
      <h4 class="grey-text font-weight-light mt-3 mb-5">
        No results found.
      </h4>
    </div>
    <div v-else-if="resultCount > 0" class="mt-3">
      <v-card class="mx-auto mb-3" outlined v-for="(result, i) in results" :key="i">
        <div class="d-flex">
          <div class="flex-grow-1">
            <v-card-title class="align-start flex-nowrap mb-3">
              <div class="flex-grow-0">
                <v-icon left>{{ result.icon }}</v-icon>
              </div>
              <div class="flex-grow-1" style="word-break: break-word">
                <span class="font-weight-bold grey--text text--darken-3">{{ result.title }}</span>
              </div>
            </v-card-title>
            <v-card-subtitle class="font-weight-bold pb-1 card-text-small">
              {{ getSubtitle(result) }}
            </v-card-subtitle>
          </div>
          <div class="flex-grow-0 d-flex">
            <v-icon large color="grey lighten-2" @click="navigate(result)">mdi-chevron-right</v-icon>
          </div>
        </div>
      </v-card>
      <v-btn outlined rounded block color="primary" v-if="hasMore" :loading="loadingMore" @click.stop="loadMore">
        More
      </v-btn>
    </div>
  </v-container>
</template>
<script>
import { mapState, mapActions } from "vuex";
import { SharedoProfile, SharedoTypesTree, debounce } from "@sharedo/mobile-core";
import search from "./searchAgent";

export default {
  data: function () {
    return {
      overlay: false,
      showSort: false,
      loadingMore: false,
      typesTree: null,
    };
  },
  computed: {
    ...mapState({
      searchState: (state) => state.search,
    }),
    isFeeEarner: function () {
      return SharedoProfile.profile.persona === "fee-earner";
    },
    query: {
      get: function () {
        return this.searchState.query;
      },
      set: function (value) {
        this.update({ ...this.searchState, query: value });
      },
    },
    results: {
      get: function () {
        return this.searchState.results;
      },
      set: function (value) {
        this.update({ ...this.searchState, results: value });
      },
    },
    resultCount: {
      get: function () {
        return this.searchState.resultCount;
      },
      set: function (value) {
        this.update({ ...this.searchState, resultCount: value });
      },
    },
    currentPage: {
      get: function () {
        return this.searchState.currentPage;
      },
      set: function (value) {
        this.update({ ...this.searchState, currentPage: value });
      },
    },
    pageSize: function () {
      return this.searchState.pageSize;
    },
    sortBy: {
      get: function () {
        return this.searchState.sortBy || "relevance";
      },
      set: function (value) {
        this.update({ ...this.searchState, sortBy: value });
      },
    },
    sortDirection: {
      get: function () {
        return this.searchState.sortDirection;
      },
      set: function (value) {
        this.update({ ...this.searchState, sortDirection: value });
      },
    },
    hasMore: function () {
      if (this.resultCount <= 0) {
        return false;
      }

      const totalPages = Math.ceil(this.resultCount / this.pageSize);
      return totalPages > this.currentPage;
    },
  },
  watch: {
    sortBy: async function () {
      await this.search();
    },
    sortDirection: async function () {
      await this.search();
    },
  },
  methods: {
    ...mapActions({
      update: "updateSearch",
      reset: "resetSearch",
    }),
    loadTypesTree: async function () {
      this.typesTree = await SharedoTypesTree.load();
    },
    toggleSort: function () {
      this.showSort = !this.showSort;
    },
    search: async function (reload = true) {
      try {
        if (reload) {
          this.currentPage = 1;
        }

        if (this.query) {
          let opts = {
            page: this.currentPage,
            pageSize: this.pageSize,
            sortBy: this.sortBy,
            sortDirection: this.sortDirection,
          };

          if (!this.sortBy || this.sortBy === "relevance") {
            opts.sortBy = null;
            opts.sortDirection = null;
          }

          const workingSet = reload ? [] : [...this.results];
          const response = await search.run(this.query, opts);

          workingSet.push(
            ...response.results.map((item) => ({
              id: item.id,
              reference: item.data.reference,
              title: item.data.title,
              due: new Date(item.data["taskDueDate.date.local.value"]),
              icon: item.data["type.iconClass"],
              type: {
                name: item.data["type.name"],
                systemName: item.data["type.systemName"],
              },
              phase: item.data["phase.name"],
              primaryOwner:
                item.data["roles.primary-owner.ods.name"],
              primaryOwnerIcon:
                item.data["roles.primary-owner.participantType.iconClass"],
              anyDocs: !!item.data["documents!1.title"],
            }))
          );

          this.results = workingSet;
          this.resultCount = response.totalCount;
          this.overlay = false;
        } else {
          this.results = null;
          this.resultCount = -1;
        }
      } catch (error) {
        console.error(error);
      }
    },
    loadMore: async function () {
      this.loadingMore = true;
      this.currentPage++;

      await this.search(false);
      this.loadingMore = false;
    },
    getSubtitle: function (result) {
      let subtitle = `${result.type.name} - ${result.phase}`;

      if (result.reference) {
        subtitle = `${result.reference} - ${subtitle}`;
      }

      return subtitle;
    },
    navigate: function (item) {
      let route;

      if (this.typesTree.isDerivedFrom(item.type.systemName, ["task"])) {
        route = { name: "task-detail", params: { id: item.id } };
      } else if (this.typesTree.isDerivedFrom(item.type.systemName, ["matter"])) {
        route = { name: "matter-detail", params: { id: item.id } };
      }

      if (route) {
        this.$router.push(route);
      } else {
        console.error("Unsupported sharedo type.");
      }
    }
  },
  created: function () {
    const vm = this;

    vm.searchChanged = debounce(async function () {
      await vm.search();
    }, 500);
  },
  mounted: async function () {
    await this.loadTypesTree();

    if (this.results) {
      this.overlay = false;
    }
  }
};
</script>
<style>
#search-field {
  caret-color: white;
}

.v-toolbar .v-text-field.v-text-field--solo .v-input__control {
  min-height: 40px !important;
}

.remove-outer-padding {
  margin-left: -12px;
  margin-right: -12px;
  max-width: inherit !important;
}

.v-card__title {
  font-size: 1.1rem;
  line-height: 1.5rem;
}

.v-card__title .v-icon.v-icon {
  font-size: 22px;
}

.v-card__text,
.card-text-small {
  font-size: 0.775rem;
}

/* Purposefully unspecific CSS so red--text overrides us */
.task-lag {
  color: var(--v-secondary-darken1);
}
</style>