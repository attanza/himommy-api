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
    data: any,
    notification: any,
  ): Promise<void> {
    const message = {
      data,
      topic,
      notification,
    };
    // Send a message to devices subscribed to the provided topic.
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
