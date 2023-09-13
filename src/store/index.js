import Vue from 'vue'
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    notifications: {
      unread: 0,
      stale: false
    },
    search: {
      query: "",
      results: null,
      resultCount: -1,
      currentPage: 1,
      pageSize: 10,
      sortDirection: "ascending",
      sortBy: null
    }
  },
  actions: {
    incrementUnreadNotifications: ({ state }) => {
      state.notifications.unread++;
    },
    decrementUnreadNotifications: ({ state }) => {
      state.notifications.unread--;
    },
    setUnreadNotifications: ({ state }, unread) => {
      state.notifications.unread = unread;
    },
    resetUnreadNotifications: ({ state }) => {
      state.notifications.unread = 0;
    },
    setStaleNotifications: ({ state }, stale) => {
      state.notifications.stale = stale;
    },
    updateSearch: ({ state }, search) => {
      state.search = { ...search }
    },
    resetSearch: ({ state }) => {
      state.search = {
        query: "",
        results: null,
        resultCount: -1,
        currentPage: 1,
      }
    }
  }
})