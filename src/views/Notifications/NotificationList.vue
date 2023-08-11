<template>
  <v-container :fill-height="empty" :fluid="empty">
    <v-top-toolbar title="Notifications">
      <template v-slot:menu>
        <app-menu />
      </template>
      <template slot="right">
        <v-icon v-if="unread > 0" @click="dismissAll">mdi-close-circle</v-icon>
        <router-link :to="{ name: 'notification-settings' }">
          <v-icon> mdi-cog </v-icon>
        </router-link>
      </template>
    </v-top-toolbar>
    <v-row v-if="empty" align="center" justify="center">
      <v-col class="text-center">
        <v-icon color="success lighten-1" size="70">mdi-check-circle-outline</v-icon>
        <h3 class="grey--text">All caught up!</h3>
      </v-col>
    </v-row>
    <div v-if="!loading">
      <v-card class="mx-auto mb-3" outlined v-for="notification in notifications" :key="notification.id">
        <div class="d-flex">
          <div class="flex-shrink-0 d-flex color-code" :class="getColorCodes(notification)"></div>
          <div class="flex-grow-1">
            <v-card-title class="align-start flex-nowrap pb-2">
              <div class="flex-grow-0">
                <v-icon v-if="!notification.hasBeenDismissed" color="primary" left>mdi-checkbox-blank-circle</v-icon>
              </div>
              <div class="flex-grow-1" style="word-break: break-word">
                <span class="font-weight-bold grey--text text--darken-3">{{ notification.title }}</span>
              </div>
            </v-card-title>
            <v-card-text class="grey--text text--darken-1">
              <div class="timestamp">
                {{ getTimestamp(notification) }}
              </div>
              <div>
                {{ notification.message }}
              </div>
              <div class="sharedo-title">
                {{ notification.sharedoTitle }}
              </div>
              <v-btn v-if="!notification.hasBeenDismissed" class="mt-3" color="error" x-small
                @click="dismiss(notification)">
                <v-icon x-small class="me-1">mdi-close-circle</v-icon>
                Dismiss
              </v-btn>
            </v-card-text>
          </div>
          <div class="flex-grow-0 d-flex" v-if="canNavigate(notification)">
            <v-icon large color="grey lighten-2" @click="navigate(notification)">mdi-chevron-right</v-icon>
          </div>
        </div>
      </v-card>
    </div>
  </v-container>
</template>
<script>
import moment from "moment";
import { mapState, mapActions } from "vuex";
import { SharedoProfile, SharedoTypesTree } from "@sharedo/mobile-core";
import notifications from "./notificationsAgent"

export default {
  data: function () {
    return {
      loading: true,
      notifications: [],
      typesTree: null,
    }
  },
  computed: {
    ...mapState({
      unread: state => state.notifications.unread,
      stale: state => state.notifications.stale,
    }),
    empty: function () {
      return !this.loading && this.notifications.length === 0;
    }
  },
  watch: {
    stale: async function (stale) {
      if (stale) {
        await this.loadNotifications()
      }
    }
  },
  methods: {
    ...mapActions({
      setUnread: "setUnreadNotifications",
      setStale: "setStaleNotifications",
      decrementUnread: "decrementUnreadNotifications",
      resetUnread: "resetUnreadNotifications",
    }),
    load: async function () {
      try {
        await Promise.all([this.loadTypesTree(), this.loadNotifications()])
      }
      catch (error) {
        console.error(error);
      }
    },
    loadTypesTree: async function () {
      this.typesTree = await SharedoTypesTree.load();
    },
    loadNotifications: async function () {
      const response = await notifications.getFor(SharedoProfile.profile.userId);

      this.setUnread(response.numberOfNewItems);
      this.setStale(false);

      this.notifications = response.notifications;
    },
    dismiss: async function (notification) {
      try {
        await notifications.dismiss(notification.id, SharedoProfile.profile.userId);

        this.notifications.find(n => n.id === notification.id).hasBeenDismissed = true;
        this.decrementUnread();
      } catch (error) {
        console.error(error);
      }
    },
    dismissAll: async function () {
      try {
        await notifications.dismissAllFor(SharedoProfile.profile.userId);

        this.notifications.forEach(n => { n.hasBeenDismissed = true });
        this.resetUnread();
      } catch (error) {
        console.error(error);
      }
    },
    getColorCodes: function (notification) {
      const classes = {};

      switch (notification.priorityName) {
        case "20":
          classes["p-standard"] = true;
          break;
        case "40":
          classes["p-information"] = true;
          break;
        case "60":
          classes["p-warning"] = true;
          break;
        case "80":
          classes["p-critical"] = true;
          break;
      }

      if (notification.hasBeenDismissed) {
        classes.dismissed = true;
      }

      return classes;
    },
    getTimestamp: function (notification) {
      const now = moment();
      const timestamp = moment(notification.createDateTime);

      if (timestamp.isAfter(now)) {
        return now.fromNow();
      }

      return timestamp.fromNow();
    },
    canNavigate: function (notification) {
      return this.typesTree.isDerivedFrom(notification.sharedoTypeSystemName, ["task", "matter"]);
    },
    navigate: async function (notification) {
      if (!notification.hasBeenDismissed) {
        await this.dismiss(notification);
      }

      let route;

      if (this.typesTree.isDerivedFrom(notification.sharedoTypeSystemName, ["task"])) {
        route = { name: "task-detail", params: { id: notification.sharedoId } };
      } else if (this.typesTree.isDerivedFrom(notification.sharedoTypeSystemName, ["matter"])) {
        route = { name: "matter-detail", params: { id: notification.sharedoId } };
      }

      if (route) {
        this.$router.push(route);
      } else {
        console.error("Unsupported sharedo type.");
      }
    }
  },
  mounted: async function () {
    await this.load();

    this.loading = false;
  }
}
</script>
<style lang="scss" scoped>
@import "@/css/variables";

.timestamp {
  font-style: italic;
}

.color-code {
  width: 10px;

  &.p-standard {
    background-color: $color-success;

    &.dismissed {
      background-color: $color-success-lightest;
    }
  }

  &.p-information {
    background-color: $color-info;

    &.dismissed {
      background-color: $color-info-lightest;
    }
  }

  &.p-warning {
    background-color: $color-warning;

    &.dismissed {
      background-color: $color-warning-lightest;
    }
  }

  &.p-critical {
    background-color: $color-danger;

    &.dismissed {
      background-color: $color-danger-lightest;
    }
  }
}

.sharedo-title {
  background-color: $color-grey-light;
  padding: 5px;
  border-radius: 10px;
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