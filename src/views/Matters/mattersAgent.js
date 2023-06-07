import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

const getMine = (page, pageSize) => {
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
    ]
  };

  return SharedoFetch.post("/api/v1/public/workItem/findByQuery", payload);
};

export default {
  getMine
}