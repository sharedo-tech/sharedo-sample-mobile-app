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
                includeTypes: ["task"],
                includeTypesDerivedFrom: ["task"]
            },
            phase:
            {
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
            { path: "taskDueDate.date.utc.value" },
            { path: "description.html" }
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
