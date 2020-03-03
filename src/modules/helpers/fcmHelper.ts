import * as admin from 'firebase-admin';

const serviceAccount = require('../../../himommy-firebase.json');

class PushNotification {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://langsungjalan-213303.firebaseio.com',
    });
  }

  async sendToMobile(
    topic: string,
    data: { [key: string]: string },
    notification: admin.messaging.AndroidNotification,
  ): Promise<void> {
    const message: admin.messaging.Message = {
      data,
      topic,
      notification,
    };
    message.android = {
      notification: {
        sound: 'default',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };
    console.log('message', message);
    admin
      .messaging()
      .send(message)
      .then(response => {
        // Response is a message ID string.
        console.log('FCM Success Response : ', response); //eslint-disable-line
      })
      .catch(error => {
        console.log('FCM Error Response : ', error); //eslint-disable-line
      });
  }
}

export const fcm = new PushNotification();
