import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
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
