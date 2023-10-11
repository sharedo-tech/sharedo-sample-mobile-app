<template>
  <v-card>
    <v-toolbar flat outlined>
      <v-icon @click="close">mdi-close</v-icon>
      <v-spacer />
      <v-toolbar-title>New</v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-card-text>
      <tile-container class="work-item-types">
        <icon-tile label="Task" icon="fa-check-circle" :to="{ name: 'new-task', params: { parentId } }" @click="close" />
      </tile-container>
    </v-card-text>
  </v-card>
</template>
<script>
import { TileContainer, IconTile } from "@/components/common/tiles";

export default {
  props: {
    parentId: {
      type: String,
      required: false,
      default: ""
    }
  },
  components: { TileContainer, IconTile },
  methods: {
    close: function (result) {
      this.$emit("close", result);
    }
  }
}
</script>
<style scoped lang="scss">
.work-item-types {
  margin-top: 10px;
}
</style>