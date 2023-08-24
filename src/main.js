import Vue from 'vue'
import Main from './views/Main.vue'
import NotLoggedIn from './views/NotLoggedIn.vue'
import SharedoMobileCore, { SharedoAuth, SharedoProfile, CoreUi } from '@sharedo/mobile-core'
import store from "@/store";
import settings from "./app/settings.js"
import router from './router'
import vuetify from './plugins/vuetify'
import Menu from "@/components/Menu";
import "@/filters";
import '@sharedo/mobile-core/dist/global.css'
import './registerServiceWorker'

Vue.config.productionTip = false

// Keep same signature as Vue 3's createApp()
var createApp = function (view) {
    return new Vue({
        router,
        store,
        vuetify,
        render: h => h(view),
    });
};

// This needs to be a promise, as we call Azure Functions API to get Static Web App configuration
var l = CoreUi.loading();
settings.get().then(function (config) {
    l.dismiss();

    Vue.use(SharedoMobileCore, config);

    Vue.component("AppMenu", Menu);

    var notLoggedIn = function () {
        const app = createApp(NotLoggedIn);
        app.$mount("#app");
    }

    // Catch oauth reply
    SharedoAuth.initialise(notLoggedIn).then(() => {
        SharedoProfile.loadProfile().then(() => {
            createApp(Main).$mount('#app');
        })
    }, err => { document.write("<div>" + err + "</div>"); })

});
