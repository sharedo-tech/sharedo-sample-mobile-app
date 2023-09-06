<template>
  <div>
    <div class="float-right header-btns">
      <v-btn-section text v-if="documents.length && !selectDocs && canEdit" @click.stop="toggleSelect(true)">
        Select
      </v-btn-section>
      <v-btn-section text v-if="selectDocs" :disabled="selectedCount === 0" color="error" @click.stop="confirmUnlink()">
        Unlink
      </v-btn-section>
      <v-btn-section text v-if="selectDocs" color="black" @click.stop="toggleSelect(false)">
        Cancel
      </v-btn-section>
      <v-btn-section v-if="uploadAllowed">
        <form ref="uploadForm">
          <label for="input-upload">
            <v-icon>{{ uploadIcon }}</v-icon>
          </label>
          <input id="input-upload" name="files" class="d-none" type="file" multiple="true" @change="upload" />
        </form>
      </v-btn-section>
    </div>
    <label class="section-label" v-if="showLabel">{{ title }}</label>
    <slot name="placeholder" v-if="!documents.length && !loading">
      No documents
    </slot>
    <v-list flat dense class="mx-n3">
      <v-list-item-group>
        <v-list-item v-for="(doc, i) in documents" :key="i">
          <v-list-item-action v-if="selectDocs">
            <v-checkbox v-model="doc.selected" />
          </v-list-item-action>
          <v-list-item-icon @click.stop="view(doc)">
            <v-icon v-text="doc.iconClass" />
          </v-list-item-icon>
          <v-list-item-content @click.stop="view(doc)">
            <v-list-item-title v-text="doc.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>
<script>
import { VBtnSection } from "@sharedo/mobile-core"
import DocumentViewer from "./DocumentViewer"
import relatedDocuments from "./relatedDocumentsAgent";
import { makeUnique, isImage, isVideo, getExtension } from "@/util/files"

export default {
  components: { VBtnSection },
  props: {
    id: String,
    showLabel: {
      type: Boolean,
      default: false,
    },
    path: {
      type: String,
      required: false,
      default: ""
    },
    uploadIcon: {
      type: String,
      default: "mdi-upload"
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      loading: true,
      documents: [],
      repository: {},
      selectDocs: false,
    };
  },
  computed: {
    selectedCount: function () {
      return this.selectedDocuments.length;
    },
    selectedDocuments: function () {
      return this.documents.filter(d => d.selected);
    },
    title: function () {
      if (this.selectDocs) {
        return this.selectedCount
          ? `${this.selectedCount} Document${this.selectedCount > 1 ? 's' : ''} Selected`
          : "Select Documents";
      }
      else {
        return "Documents";
      }
    },
    uploadAllowed: function () {
      return !this.selectDocs && this.repository && !!this.repository.repositoryId && this.canEdit;
    },
  },
  watch: {
    uploadAllowed: function (val) {
      this.$emit("uploadAllowedChanged", val);
    },
  },
  methods: {
    load: async function () {
      try {
        this.loading = true;

        const documents = await relatedDocuments.getFor(this.id);
        documents.forEach(document => document.selected = false);

        this.documents = documents;
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    loadLinkedRepository: async function () {
      try {
        const response = await relatedDocuments.getRepositoriesFor(this.id);
        this.repository = response[0];
      } catch (error) {
        console.error(error);
      }
    },
    view: async function (document) {
      if (!this.selectDocs) {
        const ext = getExtension(document.documentId);

        if (isVideo(ext) || isImage(ext)) {
          this.$coreUi.dialog(DocumentViewer, { sharedoId: this.id, ...document });
        } else {
          const url = await relatedDocuments.getUrl(document.id);
          window.document.location.href = url;
        }
      } else {
        document.selected = !document.selected;
      }
    },
    upload: async function (event) {
      try {
        const input = event.target;
        let numberOfFiles = 0;
        let filename = null;
        const formData = new FormData();

        Array.from(input.files).forEach(file => {
          numberOfFiles++;
          filename = makeUnique(file.name, this.documents.map(document => document.title));
          formData.append("file", file, filename);
        });

        const spinner = this.$coreUi.loading();
        await relatedDocuments.upload(this.id, formData);

        if (numberOfFiles === 1) {
          this.$coreUi.toast(`Added '${filename.length > 20 ? filename.substring(0, 20) + "..." : filename}'`);
        } else {
          this.$coreUi.toast(`Added ${nFiles} files`);
        }

        spinner.dismiss();
        await this.load();
      } catch (error) {
        console.error(error);
      }
    },
    confirmUnlink: function () {
      this.$coreUi.messageBox({
        title: `Unlink ${this.selectedCount} document(s)`,
        message: "Are you sure?",
        btns: [
          { text: "Cancel" },
          { text: "Unlink", color: "error", handler: () => this.deleteSelected() }
        ]
      });
    },
    deleteSelected: async function () {
      try {
        const documentIds = this.selectedDocuments.map(document => document.id);
        const spinner = this.$coreUi.loading();

        await relatedDocuments.delete(this.id, documentIds);

        spinner.dismiss();

        this.selectDocs = false;
        await this.load();
      } catch (error) {
        console.error(error);
      }
    },
    toggleSelect: function (on) {
      this.selectDocs = on;
      this.documents.forEach(document => document.selected = false);
    }
  },
  mounted: async function () {
    await Promise.all([this.loadLinkedRepository(), this.load()]);
  }
}
</script>