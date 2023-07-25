<template>
  <v-container style='background: #f1f5f8'>
    <v-top-toolbar title="Work item list">
      <template v-slot:menu>
        <app-menu />
      </template>
      <template slot="right">
        <v-icon v-visible="!loading" @click="loadPage(true)">
          mdi-cached
        </v-icon>
      </template>
    </v-top-toolbar>
    <div v-show="loading">
      <v-skeleton-loader type="card, card, card" />
    </div>
    <v-card class="mx-auto mb-3" v-show="!loading" v-for="matter in matters" :key="matter.id" outlined>
      <div class="d-flex" @click.stop="$router.push({ name: 'matter-detail', params: { id: matter.id } })">
        <div class="flex-grow-1">
          <v-card-title class="align-start flex-nowrap mb-3">
            <div class="flex-grow-0">
              <v-icon left>{{ matter.icon }}</v-icon>
            </div>
            <div class="flex-grow-1" style="word-break: break-word;">
              <span class="font-weight-bold blue-grey--text">{{ matter.title }}</span>
            </div>
          </v-card-title>
          <v-card-subtitle class="font-weight-bold pb-1">
            {{ matter.type }} - {{ matter.phase }}
          </v-card-subtitle>
          <v-card-text class="grey--text text--darken-1">
            <div class="text-truncate">{{ matter.reference || "No reference" }}</div>
          </v-card-text>
        </div>
        <div class="flex-grow-0 d-flex">
          <v-icon large color="grey lighten-2">mdi-chevron-right</v-icon>
        </div>
      </div>
    </v-card>
  </v-container>
</template> 
<script>
import matters from "./mattersAgent";

const PAGE_SIZE = 20;

export default {
  data: function () {
    return {
      loading: true,
      loadingMore: false,
      matters: [],
      lastPageLoaded: 0,
      hasMore: true
    }
  },
  methods: {
    loadPage: async function (refresh) {
      if (refresh) {
        this.lastPageLoaded = 0;
        this.matters = [];
        this.loading = true;
      }

      this.lastPageLoaded++;

      const response = await matters.list(this.lastPageLoaded, PAGE_SIZE);

      this.loading = false;
      this.matters = response.results.map(item => ({
        id: item.id,
        reference: item.data.reference,
        title: item.data.title,
        description: item.data["description.html"],
        icon: item.data["type.iconClass"],
        type: item.data["type.name"],
        phase: item.data["phase.name"],
      }));

      const totalPages = Math.ceil(response.totalCount / PAGE_SIZE);
      const hasMore = totalPages > this.lastPageLoaded;

      return hasMore;
    }
  },
  mounted: async function () {
    try {
      this.hasMore = await this.loadPage();
    } catch (error) {
      console.error(error);
    }
  }
}
</script>