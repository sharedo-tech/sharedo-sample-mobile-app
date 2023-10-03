import { SharedoFetch } from "@sharedo/mobile-core";

const save = (id, workItem) => {
  const payload = {
    ...workItem.workItem,
    aspectData: {}
  };

  Reflect.ownKeys(workItem.aspectData).forEach(key => {
    payload.aspectData[key] = JSON.stringify(workItem.aspectData[key]);
  });

  return SharedoFetch.post(`/api/aspects/sharedos/${id}`, payload);  // Not using the public API as it is broken.
}

export default {
  save
}