import { SharedoFetch } from "@sharedo/mobile-core";

const defaults = {
  page: 1,
  pageSize: 10,
  sortBy: null,
  sortDirection: null,
  includeTypesDerivedFrom: [
    "task",
    "matter"
  ],
}

const run = (query, options = {}) => {
  const opts = { ...defaults, ...options };

  const payload = {
    search: {
      freeText: {
        input: query
      },
      sort: {
        orderBy: opts.sortBy,
        direction: opts.sortDirection
      },
      page: {
        page: opts.page,
        rowsPerPage: opts.pageSize
      },
      types: {
        includeTypesDerivedFrom: opts.includeTypesDerivedFrom
      },
      phase: {
        IncludeClosed: false,
        includeRemoved: false
      },
    },
    enrich: [
      { path: "reference" },
      { path: "title" },
      { path: "taskDueDate.date.local.value" },
      { path: "type.name" },
      { path: "type.systemName" },
      { path: "type.iconClass" },
      { path: "phase.name" },
      { path: "roles.primary-owner.ods.name" },
      { path: "roles.primary-owner.participantType.iconClass" },
      { path: "documents!1.title" },
    ]
  };

  return SharedoFetch.post("/api/v1/public/workItem/findByQuery", payload);
}

export default {
  run
}