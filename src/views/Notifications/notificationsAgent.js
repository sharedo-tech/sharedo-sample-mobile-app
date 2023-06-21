import { SharedoFetch, SharedoProfile } from '@sharedo/mobile-core'

const APP_CHANNEL_TYPE = "push";

const getSettings = async () => {
  const response = await SharedoFetch.get(`/api/user/notifications/${SharedoProfile.profile.userId}/settings`);

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

  return SharedoFetch.post(`/api/user/notifications/${SharedoProfile.profile.userId}/settingsForChannelType/${APP_CHANNEL_TYPE}`, settingList);
};

const registerForWebPush = config => SharedoFetch.post(`/api/v1/public/notifications/registerForWebPush`, config);

const getWebPushConfig = () => SharedoFetch.get(`/api/v1/public/notifications/webPushConfig`);

export default {
  getSettings,
  saveSettings,
  registerForWebPush,
  getWebPushConfig
}