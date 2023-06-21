/* eslint-disable no-console */

import { register } from 'register-service-worker'

const registration = {
  pushManager: null,
};

export default new Promise(resolve => {
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready() {
        console.log(
          'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
        )
      },
      registered(reg) {
        console.log('Service worker has been registered.')
        if (reg) {
          registration.pushManager = reg.pushManager;
          resolve(registration);
        } else {
          console.warn("Registration object is empty.");
        }
      },
      cached() {
        console.log('Content has been cached for offline use.')
      },
      updatefound() {
        console.log('New content is downloading.')
      },
      updated() {
        console.log('New content is available; please refresh.')
      },
      offline() {
        console.log('No internet connection found. App is running in offline mode.')
      },
      error(error) {
        console.error('Error during service worker registration:', error)
      }
    })
  }
});
