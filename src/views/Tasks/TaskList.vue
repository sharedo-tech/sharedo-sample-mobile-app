<template>

    <v-container style='background: #f1f5f8'>

        <VTopToolbar title="Task list" />

        <div v-show="loading">

            <v-skeleton-loader
                type="card, card, card"
            ></v-skeleton-loader>

        </div>

        <v-card
            class="mx-auto mb-3"
            outlined
            v-show="!loading"
            v-for="task in tasks"
            :key="task.id"
        >
            <v-list-item three-line>
            <v-list-item-content>
                <div class="text-overline mb-4" v-visible="false">
                2d
                </div>
                <v-list-item-title class="text-h5 mb-1">
                {{ task.title }} 
                </v-list-item-title>
                <v-list-item-subtitle>{{task.reference || "[No reference]"}}</v-list-item-subtitle>
            </v-list-item-content>

                <v-icon
                    x-large
                >mdi-check-circle-outline</v-icon>
            </v-list-item>

            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                outlined
                text
                color="primary"
                :to="{ path: task.link }"
            >
                Open
            </v-btn>
            </v-card-actions>
        </v-card>

        <v-btn
            outlined
            rounded
            text
            block
            color="primary"
            v-show="!loading && hasMore"
        >
            More
        </v-btn>
        
    </v-container>
  
  </template>

  
<script>
import tasksAgent from "./tasksAgent";

const rpp = 20;

export default {
    components: {
    },
    data()
    {
        return {
            loading: true,
            tasks: [],
            lastPageLoaded: 0,
            hasMore: true
        };
    },
    mounted()
    {
        this.loadPage().then(result =>
        {
            this.hasMore = result.hasMore;
            this.loading = false;
        }).catch(console.error);
    },
    methods:
    {
        loadPage()
        {
            return new Promise((resolve, reject) =>
            {
                this.lastPageLoaded++;

                tasksAgent.getMyTasks(rpp, this.lastPageLoaded).then(data =>
                {
                    var models = data.results.map(t =>
                    ({
                        id: t.id,
                        reference: t.data.reference,
                        title: t.data.title,
                        description: t.data["description.html"],
                        due: new Date(t.data["taskDueDate.date.utc.value"]).toLocaleString(),
                        link: "/tasks/" + t.id
                    }));

                    models.forEach(m => { this.tasks.push(m); });

                    var totalPages = Math.ceil(data.totalCount / rpp);
                    var hasMore = totalPages > this.lastPageLoaded;

                    resolve({ hasMore: hasMore });
                }).catch(console.error);
            });
        },
        
        loadNextPage(ev)
        {
            this.loadPage().then(result =>
            {
                ev.target.complete();
                if( !result.hasMore )
                {
                    ev.target.disabled = true;
                    this.hasMore = false;
                }                    
            }).catch(console.error);
        }
    }
};
</script>