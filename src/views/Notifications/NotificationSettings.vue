<template>
  <v-container>
    <v-top-toolbar title="Notification settings">
      <template v-slot:menu>
        <app-menu />
      </template>
      <template slot="left">
        <v-icon @click="saveAndBack">
          mdi-arrow-left
        </v-icon>
      </template>
    </v-top-toolbar>
    <div v-show="loading">
      <v-skeleton-loader type="paragraph@3"></v-skeleton-loader>
    </div>
    <div v-show="!loading" class="mx-n3" v-bind:class="{ 'mt-6': !$vuetify.breakpoint.xs }">
      <v-alert dense text rounded="0" class="mt-n3">Choose which notifications to receive</v-alert>
      <div v-for="category in categories" :key="category.name">
        <v-list subheader two-line flat>
          <v-subheader>{{ category.name }}</v-subheader>
          <v-list-item-group multiple>
            <v-list-item v-for="setting in category.settings" :key="setting.name">
              <template>
                <v-list-item-action>
                  <v-checkbox v-model="setting.active" color="primary" />
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>{{ setting.name }}</v-list-item-title>
                </v-list-item-content>
              </template>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-divider class="mb-2" />
      </div>
    </div>
  </v-container>
</template>
<script>
import { notifications } from "@/agents";
import { pushNotifications } from "@/services";

export default {
  data: function () {
    return {
      loading: true,
      categories: [],
      lastCategories: null,
      publicKey: null,
    };
  },
  methods: {
    checkPushStatus: async function () {
      const status = pushNotifications.status();

      if (status == null) {
        this.$coreUi.banner({
          message: "Push notifications are not currently supported on your device.",
          icon: "mdi-bell-off-outline",
          multiline: true,
        });
      } else if (status === "default") {
        this.$coreUi.banner({
          message: "Click to enable push notifications on your device.",
          icon: "mdi-bell-ring-outline",
          multiline: true,
          btns: [{
            text: "Enable",
            color: "success",
            handler: async () => {
              try {
                await pushNotifications.requestPermissionAndRegister(this.publicKey);
              } catch (error) {
                console.error(error);
              }
            }
          }],
        });
      } else if (Notification.permission === "granted") {
        try {
          await pushNotifications.getSubscriptionAndRegister(this.publicKey);

          this.$coreUi.banner({
            message: "Push notifications are enabled.",
            icon: "mdi-bell-check-outline",
            color: "success",
          });
        } catch (error) {
          console.error(error);
        }
      } else if (Notification.permission === "denied") {
        this.$coreUi.banner({
          message: "You have blocked push notifications.",
          icon: "mdi-bell-remove-outline",
          color: "error",
        });
      } else {
        console.warn(`Unknown notification permission '${status}'`);
      }
    },
    load: async function () {
      try {
        const categories = await notifications.getSettings();
        this.lastCategories = JSON.stringify(categories),
          this.categories = categories;
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    saveAndBack: async function () {
      try {
        const hasChanged = this.lastCategories !== JSON.stringify(this.categories);

        if (!this.loading && hasChanged) {
          const spinner = this.$coreUi.loading();

          await notifications.saveSettings(this.categories);

          spinner.dismiss();
        }

        this.$router.back();
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted: async function () {
    try {
      await this.load();

      const config = await notifications.getWebPushConfig();

      this.publicKey = config.vapidPublicKey;
      await this.checkPushStatus();
    } catch (error) {
      console.error(error);
    }
  }
}
</script>