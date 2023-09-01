<template>
  <v-container class="min-h-full">
    <v-top-toolbar title="Comments" :showBack="true" />
    <div v-show="loading">
      <v-skeleton-loader type="list-item-avatar@5" />
    </div>
    <v-btn outlined rounded block color="primary" v-show="!loading && hasMore" :loading="loadingMore"
      @click.stop="loadNextPage()">
      Previous
    </v-btn>
    <h4 class="grey-text font-weight-light mt-3 mb-5" v-if="!loading && !comments.length">
      There are no comments.
    </h4>
    <v-list three-line v-show="!loading" v-for="(item, index) in comments" :key="item.id" class="comment-container"
      v-bind:class="{
        sameUserAndTime: shouldCombine(item, comments[index - 1]),
        isDeleted: item.isDeleted,
      }">
      <v-subheader v-if="!isSameDay(item, comments[index - 1])">{{ item.created | calendarDate }}</v-subheader>
      <v-list-item class="comment-item">
        <v-list-item-avatar>
          <img class="user-image" v-bind:src="item.profileImageSrc" />
        </v-list-item-avatar>
        <v-list-item-content>
          <div class="caption warning--text text--darken-1" v-if="item.isPinned">
            <v-icon :size="16" color="warning">mdi-pin</v-icon>
            Pinned
          </div>
          <div class="caption grey--text text--darken-2" v-if="item.isDeleted">
            <v-icon :size="16" color="grey darken-1">mdi-trash-can-outline</v-icon>
            Deleted
          </div>
          <v-list-item-title class="comment-time font-weight-bold">
            {{ item.userFullName }}
            <span v-if="item.isPrivate"><v-icon size="16" class="ml-2">mdi-lock-outline</v-icon></span>
          </v-list-item-title>
          <div class="comment-content" v-html="item.comment"></div>
          <span class="caption font-weight-light text--disabled">{{ item.created | timeOnly }}</span>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-text-field v-if="!startedComment && !loading" block outlined placeholder="New comment..." class="mt-3"
      @focus="startNewComment()" />
    <v-rich-text-editor v-if="startedComment" v-show="!loading" v-model="newComment" placeholder="New comment..."
      @init="onRichTextInit" class="mt-3" />
    <v-col v-if="startedComment" class="text-right pb-1">
      <v-btn color="primary" class="mr-n3" :disabled="isNewCommentEmpty" @click="postComment">
        Send
      </v-btn>
    </v-col>
  </v-container>
</template>
<script>
import moment from "moment";
import comments from "./commentsAgent";
import profile from "@/views/Profile/profileAgent";
import settings from "@/app/settings";

const PAGE_SIZE = 10;
const COMBINE_THRESHOLD = 15;

export default {
  props: {
    sharedoId: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      loading: true,
      loadingMore: false,
      comments: [],
      lastPageLoaded: 0,
      hasMore: true,
      newComment: "",
      startedComment: false,
    };
  },
  computed: {
    isNewCommentEmpty: function () {
      return !this.newComment || this.newComment === "<p></p>";
    }
  },
  methods: {
    loadPage: async function () {
      this.lastPageLoaded++;

      const response = await comments.get(this.sharedoId, this.lastPageLoaded, PAGE_SIZE);

      await this.enrichProfileImages(response.rows);

      this.comments.unshift.apply(this.comments, response.rows.reverse());
      this.loading = false;

      const totalPages = Math.ceil(response.rows / PAGE_SIZE);
      return totalPages > this.lastPageLoaded;
    },
    loadNextPage: async function () {
      try {
        this.loadingMore = true;
        this.hasMore = await this.loadPage();
        this.loadingMore = false;
      } catch (error) {
        console.error(error);
      }
    },
    refresh: async function () {
      this.comments = [];
      this.lastPageLoaded = 0;
      this.hasMore = true;
      this.newComment = "";
      this.startedComment = false;

      this.hasMore = await this.loadPage();
      this.scrollToBottom();
    },
    enrichProfileImages: async function (comments) {
      const userIds = comments.map(c => c.userId).filter((id, ix, a) => id && a.indexOf(id) === ix);

      for (let i = 0; i < userIds.length; i++) {
        const id = userIds[i];
        let url = `${settings.api}/theme/images/default-profile.jpg`;

        try {
          const image = await profile.getAvatar(id);
          if (image) {
            url = `data:${image.mimeType};base64,${image.content}`
          }
        } catch (error) {
          console.warn(`User ${id} has no profile image (${error})`);
        } finally {
          comments
            .filter(c => c.userId === id)
            .forEach(c => {
              c.profileImageSrc = url;
            });
        }
      }
    },
    isSameDay: function (x, y) {
      return y && moment(x.created).dayOfYear() === moment(y.created).dayOfYear();
    },
    shouldCombine: function (x, y) {
      if (!y || x.userId !== y.userId || x.isPrivate !== y.isPrivate) {
        return false;
      }

      return moment(x.created).diff(y.created, "minutes") < COMBINE_THRESHOLD;
    },
    startNewComment: function () {
      this.startedComment = true;
    },
    postComment: async function () {
      try {
        if (!this.isNewCommentEmpty) {
          await comments.post(this.sharedoId, this.newComment);
          await this.refresh();
        }
      } catch (error) {
        console.error(error);
      }
    },
    onRichTextInit: function () {
      setTimeout(() => {
        this.scrollToBottom(() => {
          document.getElementsByClassName("ProseMirror")[0].focus();
        });
      }, 0);
    },
    scrollToBottom: function (callback) {
      this.$nextTick(function () {
        window.scrollTo(0, document.body.scrollHeight);
        if (typeof callback === "function") {
          callback();
        }
      });
    }
  },
  mounted: async function () {
    await this.refresh();
  }
}
</script>