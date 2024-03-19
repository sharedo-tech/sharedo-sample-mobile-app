<template>
  <v-container>
    <VTopToolbar title="New Task" :showBack="true">
      <template v-slot:menu>
        <app-menu />
      </template>
    </VTopToolbar>
    <div v-if="loading">
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
    </div>
    <v-container v-else>
      <v-row>
        <v-select label="Work Item" v-model="selectedMatter" :items="matterItems" :disabled="!!parentId" />
      </v-row>
      <v-row>
        <v-text-field label="Reference" v-model="reference" required :error="referenceErrors.length > 0"
          :error-count="referenceErrors.length" :error-messages="referenceErrors" />
      </v-row>
      <v-row>
        <v-text-field label="Title" v-model="title" required :error="titleErrors.length > 0"
          :error-count="titleErrors.length" :error-messages="titleErrors" />
      </v-row>
      <v-row>
        <v-textarea label="Description" v-model="description" required :error="descriptionErrors.length > 0"
          :error-count="descriptionErrors.length" :error-messages="descriptionErrors" />
      </v-row>
      <v-row>
        <v-text-field label="Due Date" v-model="dueDateInput" type="datetime-local" placeholder="dd/mm/yyyy hh:mm"
          required :error="dueDateErrors.length > 0" :error-count="dueDateErrors.length"
          :error-messaged="dueDateErrors" />
      </v-row>
      <v-row>
        <v-btn color="primary" @click="save" :disabled="errorCount > 0">Create</v-btn>
        <v-btn @click="$router.back()">Cancel</v-btn>
      </v-row>
    </v-container>
  </v-container>
</template>
<script>
import moment from "moment";
import { validate, required, maxLength } from "@sharedo/mobile-core/src/validation";
import { matters, tasks } from "@/agents";

export default {
  props: {
    parentId: {
      type: String,
      required: false,
      default: ""
    }
  },
  data: function () {
    return {
      reference: "",
      title: "",
      description: "",
      dueDate: moment().utc().format(),
      matters: [],
      loading: true,
      selectedMatter: this.parentId
    }
  },
  computed: {
    dueDateInput: {
      get: function () {
        if (this.dueDate) {
          return moment(this.dueDate).format("YYYY-MM-DDTHH:mm");
        }

        return null;
      },
      set: function (value) {
        if (value) {
          this.dueDate = moment(value).utc().format();
        } else {
          this.dueDate = null;
        }
      }
    },
    matterItems: function () {
      return this.matters.map(matter => ({
        text: `${matter.data.reference} - ${matter.data.title}`,
        value: matter.id
      }));
    },
    referenceErrors: function () {
      return validate(
        this.reference,
        required("A reference is required."),
        maxLength(200));
    },
    titleErrors: function () {
      return validate(this.title, required("A title is required."))
    },
    descriptionErrors: function () {
      return validate(this.description, required("A description is required."))
    },
    dueDateErrors: function () {
      return validate(this.dueDateInput, required("A due date is required."))
    },
    errorCount: function () {
      return [
        ...this.referenceErrors,
        ...this.titleErrors,
        ...this.descriptionErrors,
        ...this.dueDateErrors
      ].length;
    }
  },
  methods: {
    loadMatters: async function () {
      try {
        const response = await matters.list(1, 1000);  // Just get the first 1000, that should be more than enough.  Looks like elastic errors if large numbers are requested (even if no where near as many are returned).
        this.matters = response.results;
      } catch (error) {
        console.error(error);
      }
    },
    save: async function () {
      try {
        const task = {
          ParentSharedoId: this.parentId,
          workItem: {
            sharedoTypeSystemName: "task",
            title: this.title,
            reference: this.reference,
            description: this.description
          },
          aspectData: {
            task: {
              dueDateTime: this.dueDate
            }
          }
        };

        const response = await tasks.create(task);
        await tasks.takeOwnership(response.workItem.id);

        this.$router.push({ name: "task-detail", params: { id: response.workItem.id } });
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted: async function () {
    await this.loadMatters();
    this.loading = false;
  }
}
</script>