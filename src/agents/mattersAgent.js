import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

const list = (page, pageSize) => {
  const payload = {
    search: {
      page: {
        page,
        rowsPerPage: pageSize
      },
      sort: {
        direction: "ascending",
        orderBy: "title"
      },
      types: {
        includeTypesDerivedFrom: [
          "matter"
        ]
      },
      phase: {
        IncludeClosed: false,
        includeRemoved: false
      },
      ownership: {
        myScope: {
          ownerIds: [SharedoProfile.profile.userId],
          primary: true,
          secondary: false
        }
      }
    },
    enrich: [
      { path: "reference" },
      { path: "title" },
      { path: "description.html" },
      { path: "type.name" },
      { path: "type.iconClass" },
      { path: "phase.name" },
      { path: "roles.primary-owner.ods.name" },
      { path: "roles.primary-owner.participantType.iconClass" },
      { path: "documents!1.title" },
    ]
  };

  return SharedoFetch.post("/api/v1/public/workItem/findByQuery", payload);
};

const get = (id) => SharedoFetch.get(`/api/v1/public/workItem/${id}`);

export default {
  list,
  get
}