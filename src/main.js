import Vue from 'vue'
import Main from './views/Main.vue'
import NotLoggedIn from './views/NotLoggedIn.vue'
import SharedoMobileCore, { SharedoAuth, SharedoProfile } from '@sharedo/sharedo-mobile-core'
import settings from "./app/settings.js";
import router from './router';
import vuetify from './plugins/vuetify'
import '@sharedo/sharedo-mobile-core/dist/global.css'

Vue.config.productionTip = false

Vue.use(SharedoMobileCore, settings);

// Keep same signature as Vue 3's createApp()
var createApp = function (view) {
    return new Vue({
        router,
        vuetify,
        render: h => h(view),
    });
};

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
