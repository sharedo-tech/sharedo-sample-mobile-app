<template>
  <div>
    <label class="section-label" v-if="showLabel">Participants</label>

    <div v-if="participants.length === 0 && !loading">No participants</div>

    <v-list flat dense class="-mx-3">
      <v-list-item-group>
        <v-list-item v-for="participant in participants" :key="participant.odsId">
          <v-list-item-icon>
            <v-icon @click.stop="showContactDetails(participant)">{{
              getIcon(participant)
            }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="getLabel(participant)"
              @click.stop="showContactDetails(participant)"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>
<script>
import { MapUrlGenerator, ContactUrlGenerator } from "@sharedo/mobile-core";
import participants from "./participantsAgent";
import { toOdsEntityType } from "@/util/mappers/participantTypeMapper";
import { fromParticipantLocation } from "@/util/mappers/locationMapper";

const icons = {
  person: "mdi-account-outline",
  team: "account-group-outline",
  organisation: "mdi-domain",
  email: "mdi-email-outline",
  mobile: "mdi-phone-outline",
  "direct-line": "mdi-phone-outline",
};

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      loading: true,
      participants: [],
    };
  },
  methods: {
    async load() {
      this.loading = true;

      try {
        const response = await participants.getParticipantsFor(this.id);
        this.participants = response.filter(
          (participant) =>
            participant.participantRoleCategorySystemName !==
            "system-participants"
        );
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async loadContactDetails(participant, actionSheetItems) {
      try {
        const odsEntityType = toOdsEntityType(
          participant.participantType
        );

        const details = await participants.get(odsEntityType, participant.odsId);

        if (details.contactDetails.length > 0) {
          for (const contact of details.contactDetails) {
            const urlGenerator = ContactUrlGenerator.getFor(contact);
            actionSheetItems.push({
              text: contact.contactValue,
              icon:
                icons[contact.contactTypeSystemName] ||
                "mdi-access-point",
              url: urlGenerator ? urlGenerator.generate() : null,
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    },

    async loadAddressDetails(participant, actionSheetItems) {
      try {
        const locationIds = await participants.getLocationsFor(
          participant.odsId
        );

        if (locationIds.length > 0) {
          const locations = await Promise.all(
            locationIds.map((id) => participants.getLocation(id))
          );

          for (const location of locations) {
            const urlGenerator = MapUrlGenerator.getFor(fromParticipantLocation(location));

            actionSheetItems.push({
              text: `${location.addressLine1}, ${location.town}, ${location.postCode}`,
              icon: "mdi-map-marker-outline",
              url: urlGenerator ? urlGenerator.generate() : null,
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },

    async showContactDetails(participant) {
      const actionSheetItems = [
        { type: "header", text: "Contact Details" },
      ];

      var loading = this.$coreUi.loading();

      await this.loadContactDetails(participant, actionSheetItems);
      await this.loadAddressDetails(participant, actionSheetItems);

      loading.dismiss();

      if (actionSheetItems.length == 1) {
        actionSheetItems.push({
          text: "No contact details available.",
        });
      }

      this.$coreUi.actionSheet({
        items: actionSheetItems,
      });
    },

    getIcon(participant) {
      return icons[participant.participantType] || "mdi-account-outline";
    },

    getLabel(participant) {
      return `${participant.odsName} (${participant.participantRoleTypeName})`;
    },
  },
  async mounted() {
    await this.load();
  },
};
</script>