import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

const APP_CHANNEL_TYPE = "push";

const getSettings = async () => {
  const response = await SharedoFetch.get(`/api/v1/public/notifications/${SharedoProfile.profile.userId}/settings`);

  const categories = [];

  response.categories.forEach(category => {
    const settings = [];

    category.notificationTypes.forEach(type => {
      const preference = type.channelPreferences.find(pref => pref.channelTypeSystemName === APP_CHANNEL_TYPE && pref.frequency === 5);

      if (preference) {
        settings.push({
          name: type.name,
          active: preference.selected,
          systemName: type.systemName
        });
      }
    });

    categories.push({
      name: category.categoryOptionSetValue.name,
      settings: settings
    });
  });

  return categories;
};

const saveSettings = categories => {
  const settingList = [];

  categories.forEach(category => {
    category.settings.forEach(setting => {
      settingList.push({
        channelTypeSystemName: APP_CHANNEL_TYPE,
        frequency: setting.active ? 5 : 0,
        notificationTypeSystemName: setting.systemName,
      });
    });
  });

  return SharedoFetch.put(`/api/v1/public/notifications/${SharedoProfile.profile.userId}/settings/${APP_CHANNEL_TYPE}`, settingList);
};

const registerForWebPush = config => SharedoFetch.post(`/api/v1/public/notifications/registerForWebPush`, config);

const getWebPushConfig = () => SharedoFetch.get(`/api/v1/public/notifications/webPushConfig`);

const getFor = userId => SharedoFetch.get(`/api/notifications/${userId}/quickView`);

const dismiss = (notificationId, userId) => SharedoFetch.delete(`/api/notifications/${notificationId}/${userId}/dismiss`);

const dismissAllFor = userId => SharedoFetch.delete(`/api/notifications/${userId}/dismiss`);

export default {
  getSettings,
  saveSettings,
  registerForWebPush,
  getWebPushConfig,
  getFor,
  dismiss,
  dismissAllFor
}