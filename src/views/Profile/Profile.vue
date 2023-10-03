<template>
  <v-container>
    <v-top-toolbar title="Profile">
      <template v-slot:menu>
        <app-menu />
      </template>
    </v-top-toolbar>
    <div v-if="loading">
      <v-skeleton-loader type="list-item-avatar-two-line, list-item-three-line, divider, list-item" />
    </div>
    <div v-if="!loading">
      <div class="d-flex">
        <div class="flex-grow-0 mx-4">
          <v-avatar size="85">
            <img v-bind:src="profileImageSrc" />
          </v-avatar>
        </div>
        <div class="flex-grow-1 mt-3">
          <h3 class="grey--text text--darken-3">{{ name }}</h3>
        </div>
      </div>
      <v-list dense disabled>
        <v-list-item-group v-if="availability">
          <v-list-item>
            <v-list-item-icon>
              <v-icon :color="availability.colour">{{ availability.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title :class="availability.colour + '--text text--darken-2 font-weight-regular'">
                {{ availability.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-for="(item, idx) in contactDetails" :key="idx">
            <v-list-item-icon>
              <v-icon color="grey">{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title class="font-weight-regular grey--text text--darken-2">
                {{ item.value }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </div>
  </v-container>
</template>
<script>
import { SharedoProfile } from "@sharedo/mobile-core";
import { profile } from "@/agents";
import { DEFAULT_AVATAR } from "@/constants/urls";

const FALLBACK_CONTACT_ICON = "mdi-access-point";

export default {
  data: function () {
    return {
      loading: true,
      name: null,
      profileImageDefault: null,
      profileImageBase64: null,
      availability: {},
      contactDetails: [],

      // Hardcode since unlikely to change
      availabilityOptions: {
        "available": { name: "Available", icon: "mdi-check", colour: "success" },
        "out-of-office": { name: "Out of Office", icon: "mdi-clock-outline", colour: "warning" },
        "not-available": { name: "Not Available", icon: "mdi-cancel", colour: "error" },
      },
      contactTypes: {
        "email": { icon: "mdi-email-outline" },
        "mobile": { icon: "mdi-phone-outline" },
        "direct-line": { icon: "mdi-phone-outline" },
      },
    }
  },
  computed: {
    profileImageSrc: function () {
      return this.profileImageBase64 ?? this.profileImageDefault;
    },
  },
  methods: {
    loadProfile: async function () {
      this.name = SharedoProfile.profile.name;
      this.profileImageDefault = DEFAULT_AVATAR;

      const myProfile = await profile.get();

      this.availability = this.availabilityOptions[myProfile.availabilitySystemName] || {};
      this.contactDetails = myProfile.aspectData.contactDetails
        .map(item => {
          let icon = FALLBACK_CONTACT_ICON;

          if (this.contactTypes[item.contactTypeSystemName]) {
            icon = this.contactTypes[item.contactTypeSystemName].icon;
          }

          return {
            value: item.contactValue,
            icon
          };
        })
        .filter(item => item.icon);
    },
    loadAvatar: async function () {
      const avatar = await profile.getAvatar();

      this.profileImageBase64 = avatar ? `data:${avatar.mimeType};base64,${avatar.content}` : null;
    },
    showActionSheet: function () {
      this.$coreUi.actionSheet({
        items: [{
          text: "Notification settings", color: "primary", icon: "mdi-bell-outline",
          handler: () => this.$router.push({ name: "notification-settings" })
        }]
      });
    },
  },
  mounted: async function () {
    try {
      await Promise.all([
        this.loadProfile(),
        this.loadAvatar()
      ]);

      this.loading = false;
    } catch (error) {
      console.error(error);
    }
  }
}
</script>
<style scoped>
.item-subtitle {
  font-size: 11px;
}
</style>