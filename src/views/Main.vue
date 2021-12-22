<template>
    <v-app>

        <v-main class="has-bottom-nav">
            <router-view></router-view>

            <VBottomNav>

                <template slot="contents">                
                    <v-btn :to="{ path: '/tasks' }">
                        <span>Tasks</span>
                        <v-icon>mdi-checkbox-multiple-marked-circle-outline</v-icon>
                    </v-btn>

                    <v-btn :to="{ name: 'new-task' }">
                        <span>New Task</span>
                        <v-icon>mdi-plus-circle-outline</v-icon>
                    </v-btn>

                    <v-btn :to="{ name: 'search' }">
                        <span>Search</span>
                        <v-icon>mdi-magnify</v-icon>
                    </v-btn>
                </template>

            </VBottomNav>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: "Main",

    components: {
    },

    data: function () {
        return {
        };
    },
};
</script>
