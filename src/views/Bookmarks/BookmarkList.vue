<template>
  <v-container class="list-bg min-h-full">
    <VTopToolbar title="Bookmarks" show-back />
    <div v-show="loading">
      <v-skeleton-loader type="image, text, image, text, image" />
    </div>
    <h4 class="grey-text font-weight-light mt-3 mb-5" v-if="!loading && !bookmarks.length">
      You have not bookmarked anything yet.
    </h4>
    <v-card class="mx-auto mb-3" outlined v-show="!loading" v-for="bookmark in bookmarks" :key="bookmark.id">
      <div class="d-flex" @click.stop="bookmarkClicked(bookmark.id)">
        <div class="flex-grow-1">
          <v-card-title class="align-start flex-nowrap pb-2">
            <div class="flex-grow-0">
              <v-icon left>{{ bookmark.typeIcon }}</v-icon>
            </div>
            <div class="flex-grow-1" style="word-break: break-word">
              <span class="
                                  font-weight-bold
                                  grey--text
                                  text--darken-3
                              ">{{ bookmark.title }}</span>
            </div>
          </v-card-title>
        </div>
        <div class="flex-grow-0 d-flex">
          <v-icon large color="grey lighten-2">mdi-chevron-right</v-icon>
        </div>
      </div>
    </v-card>
  </v-container>
</template>
<script>
import bookmarks from "./bookmarksAgent";

export default {
  data: function () {
    return {
      loading: true,
      bookmarks: [],
    };
  },
  methods: {
    load: async function () {
      try {
        this.bookmarks = await bookmarks.get();
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    bookmarkClicked: function (id) {
      this.$router.push({
        name: "task-detail",
        params: { id },
      });
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
  font-size: 0.775rem;
}

/* Purposefully unspecific CSS so red--text overrides us */
.task-lag {
  color: var(--v-secondary-darken1);
}
</style>