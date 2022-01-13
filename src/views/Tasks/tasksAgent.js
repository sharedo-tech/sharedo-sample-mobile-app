import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

function getMyTasks(rpp, p)
{
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
                    ownerIds:[SharedoProfile.profile.userId],
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

function getTask(id)
{
    // TODO remove
    if( !id ) throw "getTask: no id";

    return SharedoFetch.get(`/api/v1/public/workItem/${id}`);
}

export default 
{
    getMyTasks,
    getTask
};
