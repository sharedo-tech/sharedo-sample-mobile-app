import Vue from 'vue'
import Main from './views/Main.vue'
import NotLoggedIn from './views/NotLoggedIn.vue'
import SharedoMobileCore, { useVuetify, useTipTapVuetify, SharedoAuth, SharedoProfile, CoreUi } from '@sharedo/mobile-core'
import store from "@/store";
import settings from "./app/settings.js"
import router from './router'
import Menu from "@/components/Menu";
import "@/filters";
import '@sharedo/mobile-core/dist/global.css'
import "@/css/app.scss";
import './registerServiceWorker'

Vue.config.productionTip = false

// Keep same signature as Vue 3's createApp()
var createApp = function (view, opts) {
  return new Vue({
    ...opts,
    render: h => h(view),
  });
};

// This needs to be a promise, as we call Azure Functions API to get Static Web App configuration
var l = CoreUi.loading();
settings.get().then(function (config) {
  l.dismiss();

  const vuetify = useVuetify({
    theme: {
      options: {
        customProperties: true,     // Generate CSS variables
      },
      themes: {
        light: {
          primary: '#27aa5e',
          secondary: '#b0bec5',
          accent: '#8c9eff',
          error: '#b71c1c',
          grey: '#9E9E9E',
        },
      },
    },
  });

  useTipTapVuetify(vuetify);

  Vue.use(SharedoMobileCore, config);

  Vue.component("AppMenu", Menu);

  var notLoggedIn = function () {
    const app = createApp(NotLoggedIn, {
      router,
      store,
      vuetify,
    });
    app.$mount("#app");
  }

  // Catch oauth reply
  SharedoAuth.initialise(notLoggedIn).then(() => {
    SharedoProfile.loadProfile().then(() => {
      createApp(Main, {
        router,
        store,
        vuetify
      }).$mount('#app');
    }, err => { document.write("<div>" + err + "</div>"); })

  });
});
