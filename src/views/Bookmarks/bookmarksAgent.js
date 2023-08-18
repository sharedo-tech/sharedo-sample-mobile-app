import { SharedoFetch } from '@sharedo/mobile-core'

const getEnabledTypes = () => SharedoFetch.get("/api/featureFramework/BookmarkCaseTypeFeature/enabledSharedoTypes");

const get = () => SharedoFetch.get("/api/sharedo/bookmarks");

const isBookmarked = sharedoId => SharedoFetch.get(`/api/sharedo/bookmarks/${sharedoId}/_isMarked`);

const bookmark = sharedoId => SharedoFetch.post(`/api/sharedo/bookmarks/${sharedoId}`);

const removeBookmark = sharedoId => SharedoFetch.delete(`/api/sharedo/bookmarks/${sharedoId}`);

export default {
    get,
    getEnabledTypes,
    isBookmarked,
    bookmark,
    removeBookmark
}