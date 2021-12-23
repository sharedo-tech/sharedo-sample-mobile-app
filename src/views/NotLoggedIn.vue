<template>
    <v-app>
        <v-app-bar app color="primary" dark prominent>
            <v-spacer />

            <v-toolbar-title>
                <img
                    src="https://www.sharedo.co.uk/wp-content/uploads/2019/07/sharedo-logo-wo.png"
                    height="60"
                />
            </v-toolbar-title>

            <v-spacer />
        </v-app-bar>

        <v-main>
            <v-container fill-height fluid style="background: #b0bec5">
                <v-row align="center" justify="center">
                    <v-col class="ml-3 mr-3">
                        <v-btn
                            depressed
                            block
                            rounded
                            color="primary"
                            @click="reallyRedirectToLogin()"
                            min-width="150"
                            :loading="loading"
                            
                        >
                            Log in
                        </v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import { SharedoAuth } from '@sharedo/mobile-core'

export default {
    name: "NotLoggedIn",

    data: function () {
        return {
            loading: false
        };
    },

    methods: {
        reallyRedirectToLogin() {
            this.loading = true;

            // HACK - test spinner with timeout
            setTimeout(function() {
                SharedoAuth.reallyRedirectToLogin();
            }, 600);
        },
    },
};
</script>
