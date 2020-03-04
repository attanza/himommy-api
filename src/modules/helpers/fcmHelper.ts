import { Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

class PushNotification {
  constructor() {
    const serviceAccount = require('../../../himommy-firebase.json');
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
    Logger.log(message, 'FCM');
    admin
      .messaging()
      .send(message)
      .then(response => {
        Logger.log(response, 'FCM Response');
      })
      .catch(error => {
        Logger.log(error, 'FCM Error');
      });
  }
}

export const fcm = new PushNotification();
