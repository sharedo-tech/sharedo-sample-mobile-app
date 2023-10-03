import Vue from 'vue';
import VueRouter from 'vue-router';
import WorkItemList from "@/views/WorkItems/WorkItemList";
import { TASK, MATTER } from "@/constants/workItemTypes";

Vue.use(VueRouter);

const routes = [
  {
    // Tab 1
    path: '/tasks',
    alias: '/',           // <= default page
    name: 'tasks',
    props: () => ({
      type: TASK
    }),
    component: WorkItemList
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
    props: ({ params }) => ({
      id: params.id,
      type: TASK
    }),
    component: () => import("@/views/WorkItems/WorkItemDetail.vue")
  },
  {
    // Tab 1 -> Detail -> Time Entries
    path: "/tasks/:id/time",
    name: "task-time-entries",
    props: ({ params }) => ({
      sharedoId: params.id
    }),
    component: () => import('@/views/Time/TimeEntryList.vue')
  },
  {
    // Tab 1 -> Detail -> Participants
    path: "/tasks/:id/participants",
    name: "task-participants",
    props: ({ params }) => ({
      sharedoId: params.id
    }),
    component: () => import('@/views/Participants/ParticipantList.vue')
  },
  {
    // Tab 1 -> Detail -> Chronology
    path: "/tasks/:id/chronology",
    name: "task-chronology",
    props: ({ params }) => ({
      sharedoId: params.id
    }),
    component: () => import('@/views/Chronology/ChronologyList.vue')
  },
  {
    // Tab 1 -> Detail -> Comments
    path: "/tasks/:id/comments",
    name: "task-comments",
    props: ({ params }) => ({
      sharedoId: params.id
    }),
    component: () => import('@/views/Comments/CommentList.vue')
  },
  {
    // Tab 1 -> Bookmarks
    path: "/bookmarks",
    name: "bookmarks",
    component: () => import('@/views/Bookmarks/BookmarkList.vue')
  },
  {
    // Tab 2
    path: '/new-task',
    name: 'new-task',
    component: () => import("@/views/Tabs/NewTask.vue")
  },
  {
    // Tab 3
    path: '/search',
    name: 'search',
    component: () => import("@/views/Tabs/Search.vue")
  },
  {
    path: "/work-items",
    name: "matters",
    props: () => ({
      type: MATTER
    }),
    component: WorkItemList
  },
  {
    path: "/work-items/:id",
    name: "matter-detail",
    props: ({ params }) => ({
      id: params.id,
      type: MATTER
    }),
    component: () => import("@/views/WorkItems/WorkItemDetail.vue")
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
