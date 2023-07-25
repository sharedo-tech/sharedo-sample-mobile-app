import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

const get = () => SharedoFetch.get(`/api/aspects/ods/user/${SharedoProfile.profile.userId}`);

const getAvatar = userId => SharedoFetch.get(`/api/user/${userId || SharedoProfile.profile.userId}/profileImage/asBase64`);

export default {
  get,
  getAvatar
}