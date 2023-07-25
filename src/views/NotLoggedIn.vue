<template>
    <v-app>
        <v-main>
            <v-container primary fill-height fluid id="not-logged-in">
                <v-spacer />
                <v-row>
                    <v-container>
                        <div class="mb-15"></div>
                        <v-row>
                            <v-col class="ml-3 mr-3">
                                <v-btn depressed block rounded @click="reallyRedirectToLogin()" min-width="150"
                                    :loading="loading">
                                    Log in
                                </v-btn>

                            </v-col>
                        </v-row>
                    </v-container>
                </v-row>
            </v-container>
        </v-main>
        <v-footer padless color="primary">
            <v-col class="text-center primary--text text--darken-3" cols="12">
                powered by <strong>sharedo&trade;</strong>
            </v-col>
        </v-footer>
    </v-app>
</template>

<script>
import { SharedoAuth, InstallPrompt } from '@sharedo/mobile-core'

export default {
    name: "NotLoggedIn",

    data: function () {
        return {
            loading: false
        };
    },

    mounted: function () {
        InstallPrompt.init();
    },

    methods: {
        reallyRedirectToLogin() {
            this.loading = true;

            // HACK - test spinner with timeout
            setTimeout(function () {
                SharedoAuth.reallyRedirectToLogin();
            }, 600);
        },
    },
};
</script>

<style>
#not-logged-in .v-banner {
    position: fixed !important;
    top: 12px;
    right: 12px;
    left: 12px;
}
</style>