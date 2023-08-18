<template>
  <v-container class="min-h-full">
    <v-top-toolbar title="Participants" :showBack="true" />
    <participants v-if="sharedoId" :id="sharedoId" />
  </v-container>
</template>
<script>
import Participants from "./Participants"

export default {
  components: { Participants },
  props: {
    sharedoId: {
      type: String,
      required: true
    }
  }
}
</script>