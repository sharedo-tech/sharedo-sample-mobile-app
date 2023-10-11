import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

function getMyTasks(rpp, p) {
    return SharedoFetch.post("/api/v1/public/workItem/findByQuery",
        {
            search:
            {
                page: { rowsPerPage: rpp, page: p },
                sort: {
                    orderBy: "dueDate",
                    direction: "ascending"
                },
                types:
                {
                    includeTypes: [
                        "task",
                        "task-activity",
                        "task-appointment",
                        "assignment",
                        "change-request",
                        "task-search",
                        "case-enquiry",
                        "task-standard-approval",
                        "task-assessment",
                        "task-file-review",
                        "risk",
                        "task-service-request",
                        "demo-title-check",
                    ],
                    includeTypesDerivedFrom: [
                        "task-activity",
                        "task-appointment",
                        "task-search",
                        "task-standard-approval",
                        "task-assessment",
                        "task-service-request",
                    ],
                },
                phase:
                {
                    IncludeClosed: false,
                    includeRemoved: false
                },
                ownership:
                {
                    myScope:
                    {
                        ownerIds: [SharedoProfile.profile.userId],
                        primary: true,
                        secondary: false
                    }
                }
            },
            enrich:
                [
                    { path: "reference" },
                    { path: "title" },
                    { path: "taskDueDate.date.local.value" },
                    { path: "description.html" },
                    { path: "type.name" },
                    { path: "type.iconClass" },
                    { path: "phase.name" },
                    { path: "roles.primary-owner.ods.name" },
                    { path: "roles.primary-owner.participantType.iconClass" },
                    { path: "documents!1.title" },
                ]
        });
}

function getTask(id) {
    // TODO remove
    if (!id) throw "getTask: no id";

    return SharedoFetch.get(`/api/v1/public/workItem/${id}`);
}

function saveTask(id, updateRequest) {
    return SharedoFetch.put(`/api/v1/public/workItem/${id}`, updateRequest);
}

function getTaskActions(id) {
    // TODO add participant action info to public API?
    // TODO how do we get sharedo type icon? (path query?)
    return SharedoFetch.get(`/api/tasks/${id}`).then(r => r.participantActions);
}

function getPhaseInfo(id) {
    return SharedoFetch.get(`/api/v1/public/workItem/${id}/phase`);
}

function setPhase(id, phaseSystemName, reasonText) {
    return SharedoFetch.put(`/api/v1/public/workItem/${id}/phase`,
        {
            toPhaseSystemName: phaseSystemName,
            reasonText: reasonText,
            description: "From Mobile"
        });
}

function getPermissions(id) {
    // TODO public API? Or move to core?
    return SharedoFetch.get(`/api/sharedo/${id}/mySharedoPermissions`);
}

function takeOwnership(id) {
    // TODO public API?
    return SharedoFetch.post(`/api/tasks/${id}/takeownership`, {});
}

const getActions = async id => {
    const response = await SharedoFetch.get(`/api/tasks/${id}`);
    return response.participantActions;
}

const create = task => SharedoFetch.post("/api/v1/public/workItem", task);

export default {
    getMyTasks,
    getTask,
    saveTask,
    getTaskActions,
    getPhaseInfo,
    setPhase,
    getPermissions,
    takeOwnership,
    getActions,
    create
};
