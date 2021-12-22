import Vue from 'vue';
import VueRouter from 'vue-router';

import TaskList from '../views/Tasks/TaskList.vue';
import TaskDetail from '../views/Tasks/TaskDetail.vue';
import NewTask from '../views/Tabs/NewTask.vue';
import Search from '../views/Tabs/Search.vue';

Vue.use(VueRouter);

const routes = [
    {
        // Tab 1
        path: '/tasks',
        alias: '/',           // <= default page
        name: 'tasks',
        component: TaskList
    },
    {
        // Tab 1 -> Detail
        path: "/tasks/:id",
        name: "task-detail",
        component: TaskDetail
    },
    {
        // Tab 2
        path: '/new-task',
        name: 'new-task',
        component: NewTask
    },
    {
        // Tab 3
        path: '/search',
        name: 'search',
        component: Search
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routes,
});

export default router;
