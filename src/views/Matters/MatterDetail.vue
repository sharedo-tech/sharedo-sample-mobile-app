<template>
  <v-container>
    <v-top-toolbar title="Work Item" show-back>
      <template v-slot:menu>
        <app-menu />
      </template>
      <template slot="right">
        <v-icon>
          mdi-dots-horizontal
        </v-icon>
      </template>
    </v-top-toolbar>
    <div v-show="loading">
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
    </div>
    <div v-if="!loading && matter">
      <h3>{{ matter.title }}</h3>
      <div class="mb-2">
        <span><strong>Reference:</strong></span>
        <div>{{ matter.reference || "[No reference]" }}</div>
      </div>
      <div class="mb-2">
        <span><strong>Title:</strong></span>
        <div>{{ matter.title }}</div>
      </div>
      <v-divider class="mb-3" />
      <div>
        <span><strong>Description:</strong></span>
        <div v-html="matter.description"></div>
      </div>
    </div>
  </v-container>
</template>
<script>
import matters from "./mattersAgent";

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      loading: true,
      matter: null,
    }
  },
  methods: {
    loadMatter: async function () {
      const response = await matters.get(this.id);

      this.matter = response.workItem;
      this.loading = false;
    }
  },
  mounted: async function () {
    try {
      await this.loadMatter();
    } catch (error) {
      console.error(error);
    }
  }
}
</script>