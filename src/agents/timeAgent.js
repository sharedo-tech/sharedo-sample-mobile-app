import { SharedoFetch } from '@sharedo/mobile-core'

const getConfiguration = () => SharedoFetch.get("/api/v2/public/time/entry/config");

const listFor = (workItemId, page = 1, pageSize = 10) => {
  const payload = {
    sharedoId: workItemId,
    rowsPerPage: pageSize,
    startPage: page
  };

  return SharedoFetch.post("/api/v2/public/time/entry/search", payload);
};

const categories = () => SharedoFetch.get("/api/v2/public/time/categories");

const get = id => SharedoFetch.get(`/api/v2/public/time/entry/${id}`);

const _new = entry => SharedoFetch.post(`/api/v2/public/time/entry`, entry);

const update = (id, entry) => {
  const endPoint = {
    url: `/api/v2/public/time/entry/${id}`,
    responseType: "text"
  }; // HACK:  To get around the fact that the API reponse doesn't have a body even though an HTTP 200 is returned instead of a 204.

  return SharedoFetch.put(endPoint, entry);
};

const submit = id => {
  const endPoint = {
    url: `/api/v2/public/time/entry/${id}/submit`,
    responseType: "text"
  };

  return SharedoFetch.post(endPoint);
};

const _delete = id => SharedoFetch.delete({ url: `/api/v2/public/time/entry/${id}`, responseType: "text" });

const capture = (category, workItemId) => SharedoFetch.get(`/api/v2/public/time/capture/${encodeURIComponent(category)}/${workItemId}`);

export default {
  getConfiguration,
  listFor,
  categories,
  get,
  "new": _new,
  update,
  submit,
  "delete": _delete,
  capture
}