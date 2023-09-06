import { SharedoFetch } from "@sharedo/mobile-core";
import qs from "@/util/queryString";

const getFor = sharedoId => SharedoFetch.get(`/api/v1/public/workItem/${sharedoId}/relatedDocuments/`);

const getContent = (sharedoId, path) => {
  const url = `/api/v1/public/workItem/${sharedoId}/relatedDocuments/${encodeURIComponent(path)}`;
  return SharedoFetch.get({ url, responseType: "blob" });
}

const getRepositoriesFor = sharedoId => SharedoFetch.get(`/api/v1/public/workItem/${sharedoId}/repositories${qs.generate({ includeAncestors: true })}`);

const upload = (sharedoId, formData) => SharedoFetch.rawPost(`/api/v1/public/workItem/${sharedoId}/relatedDocuments/`, formData);

const _delete = (sharedoId, documentIds) => {
  let ids;

  if (documentIds instanceof Array) {
    ids = [...documentIds];
  } else {
    ids = [documentIds]
  }

  const url = `api/v1/public/workItem/${sharedoId}/relatedDocuments${qs.generate({ documentId: ids })}`;
  return SharedoFetch.delete({ url, responseType: "text" });
}

const getUrl = async documentId => {
  const response = await SharedoFetch.get(`/api/v1/public/document/${documentId}/url`);
  return response.url;
}

export default {
  getFor,
  getContent,
  getRepositoriesFor,
  upload,
  getUrl,
  "delete": _delete
}