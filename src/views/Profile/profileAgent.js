import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

const get = () => SharedoFetch.get(`/api/v1/public/users/${SharedoProfile.profile.userId}`);

const getAvatar = userId => SharedoFetch.get(`/api/v1/public/users/${userId || SharedoProfile.profile.userId}/avatar`);

export default {
  get,
  getAvatar
}