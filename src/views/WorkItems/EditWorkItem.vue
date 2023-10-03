<template>
  <v-card>
    <v-toolbar flat outlined>
      <v-icon @click="close()">mdi-close</v-icon>

      <v-spacer />

      <v-toolbar-title>{{ title || "Edit" }}</v-toolbar-title>

      <v-spacer />

      <v-btn @click="save()" small text>Save</v-btn>
    </v-toolbar>

    <!-- <v-card-title>
      </v-card-title>-->

    <v-card-text>
      <v-container>
        <v-row>
          <v-text-field label="Reference" v-model="reference" required
            :disabled="!workItem.referenceIsUserProvided"></v-text-field>
        </v-row>
        <v-row>
          <v-text-field label="Title" v-model="title" required :disabled="!workItem.titleIsUserProvided"></v-text-field>
        </v-row>
        <v-row v-if="isTask">
          <v-text-field type="datetime-local" label="Due" v-model="taskDueDateInput" required
            placeholder="dd/mm/yyyy"></v-text-field>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from "moment";
import { tasks, matters } from "@/agents"
import workitems from "@/agents/workItemsAgent";
import { TASK, MATTER } from "@/constants/workItemTypes";

export default {
  props: {
    type: {
      type: String,
      required: false,
      default: TASK
    },
    id: {
      type: String,
      required: true
    },
    workItem: {
      type: Object,
      required: true,
    }
  },
  data: function () {
    return {
      reference: this.workItem.reference,
      title: this.workItem.title,
      taskDueDate: this.workItem.taskDueDate
    };
  },
  computed: {
    isTask: function () {
      return this.type === TASK;
    },
    taskDueDateInput: {
      get: function () {
        return moment(this.taskDueDate).format("YYYY-MM-DDTHH:mm");
      },
      set: function (value) {
        if (value) {
          this.taskDueDate = moment(value).utc().format();
        } else {
          this.taskDueDate = "";
        }
      }
    }
  },
  methods: {
    save: async function () {
      const l = this.$coreUi.loading();

      let workItem;
      if (this.type === TASK) {
        workItem = await tasks.getTask(this.id);
      } else if (this.type === MATTER) {
        workItem = await matters.get(this.id);
      } else {
        throw "Unsupported work item type.";
      }

      workItem.workItem.reference = this.reference;
      workItem.workItem.title = this.title;

      if (this.type === TASK) {
        workItem.aspectData.task.dueDateTime = this.taskDueDate;
      }

      await workitems.save(this.id, workItem);

      l.dismiss();
      this.close(true);
    },
    close: function (result) {
      this.$emit("close", result);
    }
  },
};
</script>

<style scoped></style>