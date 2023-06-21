<template>
  <v-container :fill-height="empty" :fluid="empty">
    <v-top-toolbar title="Notifications">
      <template slot="right">
        <router-link :to="{ name: 'notification-settings' }">
          <v-icon> mdi-cog </v-icon>
        </router-link>
      </template>
    </v-top-toolbar>
  </v-container>
</template>
<script>
export default {
  data: function () {
    return {
      loading: true,
      notifications: [],
      typesTree: null,
    }
  },
  computed: {
    empty: function () {
      return !this.loading && this.notifications.length === 0;
    }
  }
}
</script>