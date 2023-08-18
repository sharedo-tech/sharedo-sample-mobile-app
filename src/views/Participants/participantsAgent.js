import { SharedoFetch } from '@sharedo/mobile-core';

const getParticipantsFor = sharedoId => SharedoFetch.get(`/api/v2/public/workItem/${sharedoId}/participants`);

const get = (entityType, odsId) => SharedoFetch.get(`/api/public/v1/${entityType}/${odsId}`);  // Do NOT use v2 as it is broken.

const getLocationsFor = odsId => SharedoFetch.get(`/api/v2/public/locations/for/${odsId}/ids`);

const getLocation = locationId => SharedoFetch.get(`/api/v2/public/locations/${locationId}`);

export default {
  get,
  getParticipantsFor,
  getLocationsFor,
  getLocation
}