<template>
  <v-container class="min-h-full">
    <v-top-toolbar title="Time Entries" show-back>
      <template v-slot:menu>
        <app-menu />
      </template>
      <template v-slot:right>
        <v-icon v-if="hasCreatePermission" @click="createEntry">mdi-plus</v-icon>
      </template>
    </v-top-toolbar>
    <div v-show="loading">
      <v-skeleton-loader type="image, text, image, text, image" />
    </div>
    <h4 class="grey-text font-weight-light mt-3 mb-5" v-if="!loading && !timeEntries.length">
      There are no time entries.
    </h4>
    <div v-show="!loading" v-for="(item, index) in timeEntries" :key="item.id">
      <v-subheader v-if="!isSameDay(item, timeEntries[index - 1])" class="px-1">{{ item.startDay }}</v-subheader>
      <v-card class="mx-auto mb-3 no-focus-on-click" outlined @click.stop="editEntry(item)">
        <div class="d-flex">
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-start flex-nowrap mb-3">
              <v-card-title class="flex-grow-0">
                <v-icon left :class="item.cssClass + '--text'">{{ item.icon }}</v-icon>
              </v-card-title>
              <div class="flex-grow-1 min-w-0">
                <h3 class="font-weight-bold grey--text text--darken-3 mt-3">
                  {{ item.start.format("HH:mm") }}
                  &ndash;
                  {{ item.end.format("HH:mm") }}<span v-if="item.startDay !== item.endDay" class="day-indicator">*</span>

                  <span class="grey--text duration">
                    (<span v-if="item.duration.hours() !== 0">{{ item.duration.hours() }}<span class="small">h </span>
                    </span>{{ item.duration.minutes() }}<span class="small">m</span>)
                  </span>
                </h3>
                <div class="data text-truncate" v-if="item.timeCodeCategoryName">{{ item.timeCodeCategoryName }}</div>
                <div class="data text-truncate" :class="{ 'missing': !item.timeCodeDescription }">
                  {{ item.timeCodeDescription || "No time code" }}</div>

                <div class="data text-truncate mt-1 font-italic secondary--text text--darken-2" v-if="item.billingNotes">
                  {{ '"' + item.billingNotes + '"' }}</div>

                <div class="data text-truncate mt-1">
                  <v-icon left small style="vertical-align: inherit;">fa-male</v-icon>
                  <span>{{ item.timekeeperName }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-grow-0 d-flex">
            <v-icon large color="grey lighten-2">mdi-chevron-right</v-icon>
          </div>
        </div>
        <v-divider />
      </v-card>
    </div>
  </v-container>
</template>
<script>
import moment from "moment";
import { SharedoProfile } from "@sharedo/mobile-core";
import time from "./timeAgent";
import TimeEntryForm from "./TimeEntryForm"

const PAGE_SZE = 99;

export default {
  components: { TimeEntryForm },
  props: {
    sharedoId: {
      type: String,
      requird: true
    }
  },
  data: function () {
    return {
      loading: true,
      timeEntries: [],
    };
  },
  computed: {
    hasCreatePermission: function () {
      return SharedoProfile.profile.globalPermissions.indexOf("core.time.create") !== -1;
    }
  },
  methods: {
    load: async function () {
      try {
        const data = await time.listFor(this.sharedoId, 1, PAGE_SZE);

        this.timeEntries = data.rows.map(t => {
          const start = moment(t.startDateTime);
          const end = moment(t.endDateTime);

          const duration = this.duration(start, end);

          return {
            id: t.id,
            icon: this.getIcon(t.stateSystemName),
            cssClass: moment(t.stateSystemName),
            startDateTime: t.startDateTime,
            endDateTime: t.endDateTime,
            start: start,
            end: end,
            duration: duration,
            durationSeconds: t.durationSeconds,
            startDay: this.toCalendarDate(start),
            endDay: this.toCalendarDate(end),
            odsId: t.odsId,
            state: t.stateSystemName,
            timekeeperName: t.timekeeperName,
            timeCode: t.timeCode,
            timeCodeDescription: t.timeCodeDescription,
            timeCodeCategoryId: t.timeCodeCategoryId,
            timeCodeCategoryName: t.timeCodeCategoryName,
            billingNotes: t.billingNotes,
          };
        });

        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    refresh: async function () {
      this.loading = true;
      await this.load();
    },
    duration: function (from, to) {
      const start = moment(from);
      const end = moment(to);

      const ms = Math.max(end.diff(start), 0);

      const roundUpMin = Math.ceil(ms / (1000 * 60)) * (1000 * 60);

      return moment.duration(roundUpMin);
    },
    toCalendarDate: function (date) {
      return date.calendar(null, {
        lastDay: '[Yesterday]',
        sameDay: '[Today]',
        lastWeek: 'dddd, DD MMMM',
        sameElse: 'L'
      });
    },
    isEditable: function (state) {
      return state === "draft" || state === "revising";
    },
    getIcon: function (state) {
      if (this.isEditable(state))
        return "mdi-file-document-edit-outline";
      else if (state === "reversed")
        return "mdi-clock-remove-outline";
      else
        return "mdi-check";
    },
    getClass: function (state) {
      if (state === "ready-to-submit" || state === "submitted")
        return "success";
      else if (state === "reversed")
        return "grey";
      else
        return "warning";
    },
    isSameDay: function (x, y) {
      return y && x.startDay === y.startDay;
    },
    createEntry: function () {
      this.$coreUi.dialog(TimeEntryForm, {
        sharedoId: this.sharedoId,
        timekeeperName: SharedoProfile.profile.name,
        canEdit: true,
        stateSystemName: "draft",
        odsId: SharedoProfile.profile.userId,
      }, {
        closing: async result => {
          if (result) {
            await this.refresh();
          }
        }
      });
    },
    editEntry: function (entry) {
      this.$coreUi.dialog(TimeEntryForm, {
        sharedoId: this.sharedoId,
        id: entry.id,
        startDateTime: new Date(entry.startDateTime),
        endDateTime: new Date(entry.endDateTime),
        durationSeconds: entry.durationSeconds,
        timeCodeCategoryId: entry.timeCodeCategoryId,
        timeCode: entry.timeCode,
        timekeeperName: entry.timekeeperName,
        billingNotes: entry.billingNotes,
        canEdit: this.isEditable(entry.state) && entry.odsId === SharedoProfile.profile.userId,
        stateSystemName: entry.state,
        odsId: entry.odsId,
      }, {
        closing: async result => {
          if (result) {
            await this.refresh();
          }
        }
      });
    }
  },
  mounted: async function () {
    await this.refresh();
  }
}
</script>
<style scoped>
.day-indicator {
  color: var(--v-error-lighten1);
}

.duration .small {
  font-size: 70%;
}

.data {
  font-size: 14px;
  color: var(--v-grey-darken3);
}

.missing {
  font-style: italic;
  color: var(--v-grey-darken1);
}
</style>