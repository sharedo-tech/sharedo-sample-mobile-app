import { SharedoFetch } from '@sharedo/mobile-core'
import { MAX_INT_VALUE } from '@/constants/numbers';

const enabled = () => SharedoFetch.get("/api/v2/public/features/Bookmarks/enabled");

const get = (limit = MAX_INT_VALUE) => SharedoFetch.get(`/api/v2/public/my/workitems/bookmarked/${limit}`);

const isBookmarked = sharedoId => SharedoFetch.get(`/api/v2/public/my/workitems/${sharedoId}/bookmarked`);

const bookmark = sharedoId => {
    const endpoint = {
        url: `/api/v2/public/my/workitems/${sharedoId}/bookmark`,
        responseType: "text"
    };

    return SharedoFetch.post(endpoint);
};

const removeBookmark = sharedoId => {
    const endpoint = {
        url: `/api/v2/public/my/workitems/${sharedoId}/bookmark`,
        responseType: "text"
    };

    return SharedoFetch.delete(endpoint);
};

export default {
    enabled,
    get,
    isBookmarked,
    bookmark,
    removeBookmark
}