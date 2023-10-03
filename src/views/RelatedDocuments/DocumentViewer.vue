<template>
  <v-card>
    <v-toolbar flat outlined>
      <v-icon @click="close()">mdi-close</v-icon>
      <v-spacer />
      <v-toolbar-title>View document</v-toolbar-title>
      <v-spacer class="mr-3" />
    </v-toolbar>
    <v-card-title>
      <span>
        {{ title }}
        <!-- Doc ID tooltip if different to title -->
        <v-tooltip bottom v-if="showInfo">
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on">mdi-information-outline</v-icon>
          </template>
          <span>{{ documentId }}</span>
        </v-tooltip>
      </span>
    </v-card-title>
    <div class="mx-6" v-show="loading">
      <v-skeleton-loader type="image" />
    </div>
    <div class="mx-6" v-show="!loading">
      <img v-bind:src="fileBase64" @error="error" v-if="isImage && !failed" class="flex min-w-full">
      <video controls autoplay v-if="isVideo && fileBase64" class="flex min-w-full">
        <source :type="videoMimeType" v-bind:src="fileBase64">
        Your browser does not support the video tag.
      </video>
      <v-alert type="warning" v-if="failed || unsupportedType">Preview not supported for this file type.</v-alert>
    </div>
  </v-card>
</template>
<script>
import { relatedDocuments } from "@/agents";
import { isImage, isVideo, getExtension } from "@/util/files";

export default {
  props: {
    id: String,
    sharedoId: String,
    title: String,
    documentId: String,
  },
  data: function () {
    return {
      document: {
        id: this.id,
      },
      url: null,
      fileBase64: null,
      videoMimeType: "video/mp4",     // should work in most cases
      failed: false,
      loading: true,
    };
  },
  computed: {
    showInfo: function () {
      return this.documentId && this.documentId !== this.title;
    },
    extension: function () {
      return getExtension(this.documentId);
    },
    isImage: function () {
      return isImage(this.extension);
    },
    isVideo: function () {
      return isVideo(this.extension);
    },
    unsupportedType: function () {
      return !this.isImage && !this.isVideo;
    },
  },
  methods: {
    error: function () {
      this.failed = true;
      this.loading = false;
    },

    close: function (result) {
      this.$emit("close", result);
    },
  },
  mounted: async function () {
    const vm = this;

    if (!vm.unsupportedType) {
      try {
        const blob = await relatedDocuments.getContent(vm.sharedoId, vm.documentId);
        const reader = new FileReader();

        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          vm.fileBase64 = reader.result;
          vm.loading = false;
        };

        reader.onerror = () => {
          vm.error();
        };
      } catch (error) {
        console.error(error);
        vm.error();
      }
    } else {
      this.error();
    }
  }
}
</script>