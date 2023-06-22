import serviceWorker from "@/registerServiceWorker";
import notifications from "./notificationsAgent";

const toBase64 = buffer => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const length = bytes.byteLength;

  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
};

const register = async subscription => {
  const config = {
    endpoint: subscription.endpoint,
    p256dh: toBase64(subscription.getKey("p256dh")),
    auth: toBase64(subscription.getKey("auth")),
  };

  await notifications.registerForWebPush(config);

  return config;
}

const status = () => {
  if (!('serviceWorker' in navigator) || !Notification.permission) {
    return null;
  }

  return Notification.permission;
}

const requestPermissionAndRegister = async publicKey => {
  if (!publicKey) {
    throw "No VAPID key.";
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    return getSubscriptionAndRegister(publicKey);
  }
}

const getSubscriptionAndRegister = async publicKey => {
  if (!publicKey) {
    throw "No VAPID key.";
  }

  const registration = await serviceWorker;

  if (!registration.pushManager) {
    throw "No push manager.";
  } else {
    let subscription = await registration.pushManager.getSubscription();
    if (subscription === null) {
      const config = {
        userVisibleOnly: true,
        applicationServerKey: publicKey
      };

      try {
        subscription = await registration.pushManager.subscribe(config);
        await register(subscription);
      } catch (error) {
        throw `Unable to subscribe to push: ${error}`;
      }
    } else {
      await register(subscription);
    }
  }
}

export default {
  status,
  requestPermissionAndRegister,
  getSubscriptionAndRegister,
}