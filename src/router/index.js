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
        path: "/profile",
        name: "profile",
        component: () => import("@/views/Profile/Profile.vue")
    },
    {
        // Tab 1 -> Detail
        path: "/tasks/:id",
        name: "task-detail",
        props: true,
        component: TaskDetail
    },
    {
        // Tab 1 -> Detail -> Time Entries
        path: "/tasks/:id/time",
        name: "task-time-entries",
        props: ({ params }) => ({
            sharedoId: params.id
        }),
        component: () => import('../views/Time/TimeEntryList.vue')
    },
    {
        // Tab 1 -> Detail -> Participants
        path: "/tasks/:id/participants",
        name: "task-participants",
        props: ({ params }) => ({
            sharedoId: params.id
        }),
        component: () => import('../views/Participants/ParticipantList.vue')
    },
    {
        // Tab 1 -> Bookmarks
        path: "/bookmarks",
        name: "bookmarks",
        component: () => import('../views/Bookmarks/BookmarkList.vue')
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
    },
    {
        path: "/work-items",
        name: "matters",
        component: () => import("@/views/Matters/MatterList.vue")
    },
    {
        path: "/work-items/:id",
        name: "matter-detail",
        props: true,
        component: () => import("@/views/Matters/MatterDetail.vue")
    },
    {
        path: '/notifications',
        name: 'notifications',
        component: () => import('@/views/Notifications/NotificationList.vue')
    },
    {
        path: "/notifications/settings",
        name: "notification-settings",
        component: () => import("@/views/Notifications/NotificationSettings.vue")
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routes,
});

export default router;
