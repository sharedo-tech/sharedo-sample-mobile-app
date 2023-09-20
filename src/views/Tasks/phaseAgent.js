import { SharedoFetch } from "@sharedo/mobile-core";

const getFor = async sharedoId => {
  const response = await SharedoFetch.get(`/api/v1/public/workItem/${sharedoId}/phase`);

  return response.availableTransitions
}

const setFor = (sharedoId, phaseSystemName, reason) => {
  const payload = {
    toPhaseSystemName: phaseSystemName,
    reasonText: reason,
    description: "From Mobile"
  };

  return SharedoFetch.put(`/api/v1/public/workItem/${sharedoId}/phase`, payload);
}

export default {
  getFor,
  setFor
}