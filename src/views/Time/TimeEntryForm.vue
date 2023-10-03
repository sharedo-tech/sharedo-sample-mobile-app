<template>
  <v-card class="time-entry-form">
    <div v-if="loaded">
      <v-toolbar flat outlined>
        <v-icon @click="close()">mdi-close</v-icon>
        <v-spacer />
        <v-toolbar-title>{{ isNew ? "New" : canEdit ? "Edit" : "View" }} time entry</v-toolbar-title>
        <v-spacer />
        <v-btn @click="save()" small text v-if="canEdit" :disabled="!isValid">Save</v-btn>
      </v-toolbar>
      <v-banner-sharedo icon="mdi-alert" icon-color="warning"
        v-if="(!timeCodeCategoryIdLocal || segmentsIncomplete) && inDraftState"> Time code required to submit.
      </v-banner-sharedo>
      <v-banner-sharedo icon="mdi-upload" icon-color="info" v-if="isReadyToSubmit"> Ready to submit.
        <template v-slot:actions>
          <v-btn text @click="submit()">Submit</v-btn>
        </template>
      </v-banner-sharedo>
      <v-card-text>
        <v-container>
          <v-row>
            <v-select label="Category" v-model="timeCodeCategoryIdLocal" v-bind:items="timeCodeCategories"
              item-text="name" item-value="systemName" single-line :disabled="!canEdit"
              :error-messages="categoryValidation" @change="timeCodeChanged" />
          </v-row>
          <v-row v-show="timeCodeCategoryIdLocal" v-for="segment in segments" :key="segment.id">
            <segment-selector v-if="segment.captureType === 'TimeCodeSet'" v-model="segment.value"
              :codes="segment.timeCodes" :error="segment.isMandatoryForEntry && !segment.value" />
            <v-textarea v-else label="Memo" v-model="segment.value" type="text" rows="4" auto-grow
              :error="segment.isMandatoryForEntry && !segment.value" />
          </v-row>
          <v-row>
            <v-text-field label="Start" v-model="startInput" required type="datetime-local" placeholder="dd/mm/yyyy hh:mm"
              :disabled="!canEdit" :error="!!startValidation" />
            <span class="error--text min-w-full" v-if="startValidation">{{ startValidation }}</span>
          </v-row>
          <v-row>
            <v-text-field label="End" v-model="endInput" required type="datetime-local" placeholder="dd/mm/yyyy hh:mm"
              :disabled="!canEdit" :error="!!endValidation" />
            <span class="error--text min-w-full" v-if="endValidation">{{ endValidation }}</span>
          </v-row>
          <v-row>
            <v-text-field label="Duration" type="text" v-model="duration" v-on:blur="onDurationBlur"
              placeholder="e.g. 1h 30m" :disabled="!canEdit" :error="!!durationValidation" />
            <span class="error--text min-w-full" v-if="durationValidation">{{ durationValidation }}</span>
          </v-row>
          <v-row>
            <v-text-field label="Owner" type="text" v-model="timekeeperName" :disabled="true" />
          </v-row>
          <v-row>
            <v-textarea label="Narrative" v-model="billingNotesLocal" type="text" rows="4" auto-grow
              :disabled="!canEdit" />
          </v-row>
        </v-container>
      </v-card-text>
      <v-row class="mt-1" v-if="canDelete">
        <v-col class="mx-6 text-center">
          <v-btn block outlined class="error--text" @click="confirmDelete()"> Delete </v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-else class="skeleton-container">
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
    </div>
  </v-card>
</template>
<script>
import { SharedoProfile } from "@sharedo/mobile-core";
import moment from "moment";
import SegmentSelector from "./SegmentSelector";
import { time } from "@/agents";

export default {
  components: { SegmentSelector },
  props: {
    id: String,
    sharedoId: String,
    canEdit: Boolean,
    stateSystemName: String,
    startDateTime: Date,
    endDateTime: Date,
    durationSeconds: Number,
    timeCodeCategoryId: String,
    timeCode: String,
    timeKeeperId: String,
    timekeeperName: String,
    billingNotes: String,
    odsId: String,
  },
  data: function () {
    return {
      startLocal: this.startDateTime,
      endLocal: this.endDateTime,
      durationSecondsLocal: this.durationSeconds,
      timeCodeCategoryIdLocal: "",
      timeCodeLocal: this.timeCode,
      billingNotesLocal: this.billingNotes,
      timeCodeCategories: [],
      timeCodes: [],
      segments: [],
      timeConfig: null,
      loaded: false,
      ui: {
        durationInput: null,
        suspend: false,
      }
    }
  },
  computed: {
    isNew: function () {
      return !this.id
    },
    canDelete: function () {
      return this.canEdit && !this.isNew && SharedoProfile.profile.globalPermissions.some((permission) => permission === "core.time.delete")
    },
    startInput: {
      get: function () {
        return this.startLocal ? moment(this.startLocal).format("YYYY-MM-DDTHH:mm") : null;
      },
      set: function (value) {
        if (value) {
          this.startLocal = moment(value).utc().format();
        }
      }
    },
    endInput: {
      get: function () {
        return this.endLocal ? moment(this.endLocal).format("YYYY-MM-DDTHH:mm") : null;
      },
      set: function (value) {
        if (value) {
          this.endDateTime = moment(value).utc().format();
        }
      }
    },
    startValidation: function () {
      return !this.startLocal ? "Start required" : null;
    },
    endValidation: function () {
      return !this.endLocal ? "End required" : null;
    },
    durationValidation: function () {
      if (this.startValidation || this.endValidation) return null;

      if (!this.durationSecondsLocal) return "Duration must be valid and non-zero";

      if (this.isNew) {
        const config = this.timeConfig;
        if (!config) {
          return null;
        }

        const earliestStart = moment().add(config.startTimeMaxDaysAgo * -1, "days");
        const latestEnd = moment().add(config.endTimeMaxDaysInFuture, "days");
        const maxHours = config.maxHours;

        const startMoment = moment(this.startLocal);
        const endMoment = moment(this.endLocal);

        if (startMoment < earliestStart) return "Start must be within the last " + config.startTimeMaxDaysAgo + " days";
        if (startMoment > latestEnd) return "Start must be within the next " + config.endTimeMaxDaysInFuture + " days";
        if (maxHours > 0) {
          if (this.durationSecondsLocal > (maxHours * 3600)) {
            return "Duration exceeds maximum allowed - must be at most " + maxHours + " hours";
          }
        }

        if (endMoment > latestEnd) {
          return "End must be within the next " + config.endTimeMaxDaysInFuture + " days";
        }
      }

      return null;
    },
    categoryValidation: function () {
      if (!this.timeCodeCategoryIdLocal) {
        return "Choose a category";
      }

      return null;
    },
    segmentsIncomplete: function () {
      return this.segments.some((segment) => segment.isMandatoryForEntry && !segment.value);
    },
    isValid: function () {
      let errors = 0;
      if (this.startValidation) {
        errors++
      }

      if (this.endValidation) {
        errors++;
      }

      if (this.durationValidation) {
        errors++;
      }

      if (this.categoryValidation) {
        errors++;
      }

      if (this.segmentsIncomplete) {
        errors++;
      }

      return errors === 0;
    },
    duration: {
      get: function () {
        if (this.ui.durationInput) {
          return this.ui.durationInput;
        }

        return this.parseSecondsToDuration(this.durationSecondsLocal);
      },
      set: function (value) {
        this.ui.durationInput = value;

        if (!value) {
          this.durationSecondsLocal = 0;
          return;
        }

        this.durationSecondsLocal = this.parseDurationToSeconds(value);
      }
    },
    availableTimeCodes: function () {
      if (!this.timeCodeCategoryIdLocal) {
        return this.timeCodes;
      }

      return this.timeCodes.filter(x => x.categoryId === this.timeCodeCategoryIdLocal);
    },
    isReadyToSubmit: function () {
      return this.startLocal && this.endLocal && this.timeCodeLocal && this.inDraftState && this.isValid;
    },
    inDraftState: function () {
      return ["draft", "revising"].indexOf(this.stateSystemName) !== -1;
    }
  },
  watch: {
    startLocal: function () {
      if (!this.ui.suspend) {
        const newEndDate = this.offsetDateTimeByDuration(this.startLocal);
        if (newEndDate) {
          this.suspendChanges(() => { this.endLocal = newEndDate; });
        }
      }
    },
    durationSecondsLocal: function () {
      if (!this.ui.suspend) {
        const newEndDate = this.offsetDateTimeByDuration(this.startLocal);
        if (newEndDate) {
          this.suspendChanges(() => { this.endLocal = newEndDate; });
        }
      }
    },
    endLocal: function () {
      if (!this.ui.suspend) {
        const startDateTimeValue = this.startLocal;
        const start = moment(startDateTimeValue);
        const endDateTimeValue = this.endLocal;
        const end = moment(endDateTimeValue);
        const diff = end.diff(start, "seconds");

        if (!start.isValid() || diff < 0) {
          var newStartDate = this.offsetDateTimeByDuration(endDateTimeValue, -1);
          if (newStartDate) {
            this.suspendChanges(() => { this.startLocal = newStartDate; });
          }
        }
        else {
          this.ui.durationInput = null;
          this.suspendChanges(() => { this.durationSecondsLocal = diff; });
        }
      }
    }
  },
  methods: {
    timeCodeChanged: async function (newValue) {
      if (newValue) {
        await this.loadCapture();
      }
    },
    loadCapture: async function () {
      try {
        const capture = await time.capture(
          this.timeCodeCategoryIdLocal,
          this.sharedoId
        );

        this.segments = capture.segments;
      } catch (error) {
        console.log(error);
      }
    },
    submit: async function () {
      try {
        await this.save(true);

        const l = this.$coreUi.loading();

        await time.submit(this.id);

        l.dismiss();
        this.close(true);
      } catch (error) {
        console.log(error);
      }
    },
    save: async function (suppressClose) {
      try {
        const l = this.$coreUi.loading();

        const entry = {
          sharedoId: this.sharedoId,
          durationSeconds: this.durationSecondsLocal,
          startDateTime: this.startLocal,
          endDateTime: this.endLocal,
          billingNotes: this.billingNotesLocal,
          regenerateBillingNotes: false, // HACK
          createdBySystem: false,
          odsId: this.odsId,
          timeCodeCategorySystemName: this.timeCodeCategoryIdLocal,
          segments: this.segments.map((segment) => ({
            id: segment.id,
            segmentValue: segment.captureType === "Memo" ? segment.value : null,
            timeCodeId: segment.captureType === "TimeCodeSet" ? segment.value : null,
          })),
        };

        const saveTimeEntry = this.isNew ? time.new(entry) : time.update(this.id, entry);

        await saveTimeEntry;

        l.dismiss();
        if (!suppressClose) {
          this.close(true);
        }
      } catch (error) {
        console.log(error);
      }
    },
    confirmDelete: function () {
      this.$coreUi.messageBox({
        title: `Delete time entry`,
        message: "Are you sure?",
        btns: [
          { text: "Cancel" },
          {
            text: "Delete",
            color: "error",
            handler: () => this.delete(),
          },
        ],
      });
    },
    delete: async function () {
      const l = this.$coreUi.loading();

      try {
        await time.delete(this.id);
        l.dismiss();
        this.close(true);
      } catch (error) {
        console.error(error);
      }
    },
    close: function (result) {
      this.$emit("close", result);
    },
    onDurationBlur: function () {
      // When duration loses focus, fix up the content of it
      this.ui.durationInput = null;
    },
    parseDurationToSeconds: function (v) {
      let totalSeconds = 0;
      const re = /(\d+)[\s,]*([a-zA-Z]+)/g;

      let matchedCount = 0;
      let matches = re.exec(v);
      while (matches) {
        matchedCount++;
        // Validation
        // Each match should be at least 3 long - eg. 32m would be ["32m", "32", "m"]
        // index [1] should be the number, index [2] should be the unit
        let validPart = true;
        if (matches.length < 3) {
          validPart = false;
        }

        if (matches.length > 2 && isNaN(matches[1])) {
          validPart = false;
        }

        // Parse
        if (validPart) {
          const value = parseInt(matches[1]);
          let unit = matches[2].toLowerCase();

          // Special handling of units that moment.duration doesn't understand
          if (unit === "min") {
            unit = "m";
          }

          if (unit === "mins") {
            unit = "m";
          }

          var seconds = moment.duration(value, unit).asSeconds();
          totalSeconds += seconds;
          //console.log("" + value + " " + unit + " parsed to " + seconds + " seconds - total is now " + totalSeconds);
        }

        // Next part
        matches = re.exec(v);
      }

      if (matchedCount === 0) {
        // None of the inputs matched things like 32m 4s 8 hours etc... just try to parse it as minutes
        var parsedAsSeconds = parseInt(v);
        if (!isNaN(parsedAsSeconds)) {
          totalSeconds = (parsedAsSeconds * 60);
        }
      }

      return totalSeconds;
    },
    parseSecondsToDuration: function (v) {
      const duration = moment.duration(v, "seconds");

      let result = "";

      // Treat hours special - there could also be days, months and years, we want it all in hours
      var hours = Math.floor(duration.asHours());
      if (hours) {
        result += hours + "h ";
      }

      if (duration.minutes()) {
        result += duration.minutes() + "m ";
      }

      if (duration.seconds()) {
        result += duration.seconds() + "s ";
      }

      return result;
    },
    offsetDateTimeByDuration: function (dateString, direction) {
      if (direction === undefined) direction = 1; {
        direction = Math.sign(direction);
      }

      if (!dateString) {
        return null;
      }

      var date = moment(dateString);
      if (!date.isValid()) {
        return null;
      }

      var duration = parseInt(this.durationSecondsLocal);
      if (isNaN(duration)) {
        duration = 0;
      }

      if (duration > 0) {
        date.add(duration * direction, "seconds");
      }

      return date;
    },
    suspendChanges: function (actions) {
      this.ui.suspend = true;
      actions();
      setTimeout(() => { this.ui.suspend = false; });
    },
  },
  mounted: async function () {
    const vm = this;

    try {
      this.timeCodeCategories =
        await time.categories();

      this.timeConfig =
        await time.getConfiguration();

      // Defaults for new time entry
      if (this.isNew) {
        var now = moment().startOf('minute');
        this.startLocal = now;
        this.endLocal = now.clone();
      } else {
        const entry = await time.get(this.id);

        this.timeCodeCategoryIdLocal = entry.timeCodeCategorySystemName;

        await this.loadCapture();

        entry.segments.forEach((segment) => {
          const matchedSegment = vm.segments.find((s) => s.id === segment.id);

          if (matchedSegment) {
            if (matchedSegment.captureType === "TimeCodeSet") {
              matchedSegment.value = segment.timeCodeId;
            } else {
              matchedSegment.value = segment.segmentValue;
            }
          }
        });
      }

      vm.loaded = true;
    } catch (error) {
      console.log(error);
    }
  }
}
</script>
<style lang="scss" scoped>
.skeleton-container {
  padding: 20px;
}
</style>