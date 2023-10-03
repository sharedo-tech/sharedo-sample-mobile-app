import { SharedoFetch } from '@sharedo/mobile-core'
import qs from "@/util/queryString";

const get = (sharedoId, page, pageSize) => {
  const params = {
    startPage: page,
    rowsPerPage: pageSize
  };

  return SharedoFetch.get(`/api/v1/public/workItem/${sharedoId}/comments${qs.generate(params)}`);
};

const post = (sharedoId, comment) => SharedoFetch.post(`/api/v1/public/workItem/${sharedoId}/comments`, { comment });

export default {
  get,
  post
}