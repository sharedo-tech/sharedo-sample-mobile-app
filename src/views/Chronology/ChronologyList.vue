<template>
  <v-container>
    <v-top-toolbar title="Chronology" show-back />
    <div v-show="loading">
      <v-skeleton-loader type="list-item-avatar@5" />
    </div>
    <h4 class="grey-text font-weight-light mt-3 mb-5" v-if="!loading && !chronology.length">
      There are no chronology events.
    </h4>
    <v-timeline align-top dense style="margin-left: -12px;" v-for="(item, index) in chronology" :key="item.id">
      <v-timeline-item hide-dot v-if="!isSameDay(item, chronology[index - 1])">
        <v-subheader class="px-0" style="height:unset">{{ item.created | calendarDate }}</v-subheader>
      </v-timeline-item>
      <v-timeline-item :color="item.poiTypeColour" :icon="item.poiTypeIcon" fill-dot>
        <v-row>
          <v-col cols="2">
            <span class="">{{ item.created | timeOnly }}</span>
          </v-col>
          <v-col>
            <strong>{{ item.title }}</strong>
            <div class="text-caption" v-if="item.notes" v-html="item.notes"></div>
            <div class="text-caption pt-1" v-if="item.userFullName">
              <v-icon small style="vertical-align: text-bottom;">mdi-account</v-icon>
              {{ item.userFullName }}
            </div>
          </v-col>
        </v-row>
      </v-timeline-item>
    </v-timeline>
    <v-btn outlined rounded block class="mt-4" color="primary" v-show="!loading && hasMore" :loading="loadingMore"
      @click.stop="loadNextPage()">
      More
    </v-btn>
  </v-container>
</template>
<script>
import chronologyAgent from "./chronologyAgent.js";
import { toChronologyListItems } from "@/util/mappers";

const PAGE_SIZE = 10;

export default {
  props: {
    sharedoId: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      loading: true,
      loadingMore: false,
      chronology: [],
      lastPageLoaded: 0,
      hasMore: true,
    };
  },
  methods: {
    loadPage: async function () {
      try {
        this.lastPageLoaded++;

        const result = await chronologyAgent.get(this.sharedoId, this.lastPageLoaded, PAGE_SIZE);
        const models = toChronologyListItems(result.rows);
        const totalPages = Math.ceil(result.totalRows / PAGE_SIZE);
        const hasMore = totalPages > this.lastPageLoaded;

        this.chronology = models;
        this.loading = false;
        return hasMore;
      } catch (error) {
        console.error(error);
      }
    },
    loadNextPage: async function () {
      try {
        this.loadingMore = true;
        this.hasMore = await this.loadPage();
        this.loadingMore = false;
      } catch (error) {
        console.error(error);
      }
    },
    refresh: async function () {
      try {
        this.chronology = [];
        this.lastPageLoaded = 0;
        this.hasMore = await this.loadPage();
      } catch (error) {
        console.error(error);
      }
    },
    isSameDay: function (x, y) {
      return y && x.createdDay === y.createdDay;
    }
  },
  mounted: async function () {
    await this.refresh();
  }
}
</script>
<style>
/* Give body more space */
.v-timeline-item__divider {
  min-width: 56px;
}

.v-timeline--dense .v-timeline-item__body {
  max-width: calc(100% - 77px);
}

.v-timeline-item__dot {
  margin-top: -7px;
}

.v-timeline-item__dot .v-icon {
  font-size: 18px;
}
</style>