import { SharedoFetch } from "@sharedo/mobile-core";
import qs from "@/util/queryString";

const get = (sharedoId, page, pageSize) => {
  var request = {
    rowsPerPage: pageSize,
    startPage: page,
    endPage: page,
    includeCaseOnlyParticipant: false,
    includeChildren: true,
  };

  return SharedoFetch.get(`/api/v1/public/workItem/${sharedoId}/chronology${qs.generate(request)}`);
}

export default {
  get,
};
