<template>
  <div>
    <v-list-item>
      <h1>Sharedo Demo App</h1>
    </v-list-item>
    <v-list-item @click.stop="$router.push({ name: 'profile' })">
      <v-list-item-action>
        <v-icon>mdi-account-outline</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Profile</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item @click="logout">
      <v-list-item-action>
        <v-icon>mdi-logout</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Log out</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </div>
</template>
<script>
import { SharedoAuth } from '@sharedo/mobile-core';

export default {
  methods: {
    logout: async function () {
      await SharedoAuth.logout();
      SharedoAuth.redirectToLogin();
    }
  }
}
</script>