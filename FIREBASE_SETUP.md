# Firebase Push Notifications Setup Guide

This guide will walk you through setting up Firebase Cloud Messaging (FCM) for push notifications in your React Native Expo app.

## 📋 Prerequisites

- Firebase account (free tier is sufficient)
- EAS CLI installed: `npm install -g eas-cli`
- Expo account (sign up at expo.dev)

## 🔥 Firebase Console Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select your existing project
3. Follow the wizard to create your project

### Step 2: Add Android App

1. In Firebase Console, click the **Android icon** to add an Android app
2. **Android package name**: `com.lehaan.DhopSiteMobile` (must match app.json)
3. **App nickname**: DhopSiteMobile (optional)
4. **SHA-1 certificate**: Leave blank for now (optional for basic FCM)
5. Click "Register app"
6. **Download `google-services.json`**
7. Place `google-services.json` in your project root directory

### Step 3: Add iOS App

1. In Firebase Console, click the **iOS icon** to add an iOS app
2. **iOS bundle ID**: `com.lehaan.DhopSiteMobile` (must match app.json)
3. **App nickname**: DhopSiteMobile (optional)
4. Click "Register app"
5. **Download `GoogleService-Info.plist`**
6. Place `GoogleService-Info.plist` in your project root directory

### Step 4: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging**
2. Under **Cloud Messaging API (Legacy)**, note the **Server Key**
3. You'll need to enable **Cloud Messaging API** in Google Cloud Console:
   - Click on the link to enable the API
   - Or go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Firebase Cloud Messaging API"

## 📱 Mobile App Configuration

### Environment Variables

Create a `.env` file in your project root (or add to existing):

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

You can find these values in Firebase Console → Project Settings → General → Your apps

### Update app.json (Already Done ✅)

The `app.json` file has been updated with:
- expo-notifications plugin
- POST_NOTIFICATIONS permission for Android
- References to google-services.json and GoogleService-Info.plist

## 🔧 Backend Server Setup

Your backend needs to:

1. **Store FCM tokens** when users register/login
2. **Send push notifications** using Firebase Admin SDK or HTTP API

### Option 1: Firebase Admin SDK (Recommended for Node.js)

```bash
npm install firebase-admin
```

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send notification
async function sendPushNotification(fcmToken, title, body, data) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

### Option 2: HTTP API (Works with any backend)

```javascript
const axios = require('axios');

async function sendPushNotification(fcmToken, title, body, data) {
  const serverKey = 'YOUR_FIREBASE_SERVER_KEY'; // From Firebase Console

  const message = {
    to: fcmToken,
    notification: {
      title: title,
      body: body,
      sound: 'default',
    },
    data: data,
    priority: 'high',
  };

  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      message,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`key=\${serverKey}\`,
        },
      }
    );
    console.log('Successfully sent message:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

### Backend API Endpoints Required

Your backend should have these endpoints (update URLs as needed):

1. **POST /notifications/register-token**
   - Body: `{ token: string, deviceType: 'ios' | 'android' }`
   - Store the FCM token for the authenticated user

2. **POST /notifications/unregister-token**
   - Body: `{ token: string }`
   - Remove the FCM token when user logs out

### Integration with Socket.IO

When your backend sends a Socket.IO event, it should also send a push notification:

```javascript
// Example: When sending a booking notification
io.to(userSocketId).emit('NEW_BOOKING', bookingData);

// Also send push notification
if (userFcmToken) {
  sendPushNotification(
    userFcmToken,
    'New Booking',
    'You have a new booking request!',
    { type: 'booking', bookingId: bookingData.id }
  );
}
```

## 🧪 Testing

### Test on Physical Device

1. **Build and install the app**:
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

2. **Check logs** to see if FCM token is generated:
   ```bash
   npx expo start
   # Check console for: "📱 Push Notification Token: ExponentPushToken[...]"
   ```

3. **Send a test notification** from Firebase Console:
   - Go to Firebase Console → Cloud Messaging
   - Click "Send your first message"
   - Enter title and message
   - Select your app
   - Send the test notification

### Test with Expo Push Notification Tool

1. Copy the Expo Push Token from logs
2. Go to [Expo Push Notification Tool](https://expo.dev/notifications)
3. Paste your token and send a test notification

## 📝 Important Notes

### App States and Notifications

The app handles notifications in three states:

1. **Foreground** (app is open):
   - Notification appears as in-app alert
   - Handled by `Notifications.setNotificationHandler`
   - Also triggers Socket.IO event handler

2. **Background** (app is minimized):
   - Notification appears in system tray
   - User can tap to open app
   - Handled by `addNotificationResponseReceivedListener`

3. **Killed** (app is closed):
   - Notification appears in system tray
   - Tapping notification launches app
   - Data accessible via `getLastNotificationResponseAsync()`

### Token Management

- FCM tokens can change (device reset, app reinstall, etc.)
- Always register token on app launch when user is authenticated
- Send token to backend after successful login
- Remove token from backend on logout

### Android vs iOS Differences

**Android:**
- Requires `google-services.json`
- Needs `POST_NOTIFICATIONS` permission (Android 13+)
- Notification channels for categorization

**iOS:**
- Requires `GoogleService-Info.plist`
- Must request permission explicitly
- User can deny permission

## 🚀 Deployment

### Build with EAS

```bash
# Development build
eas build --profile development --platform android
eas build --profile development --platform ios

# Production build
eas build --profile production --platform android
eas build --profile production --platform ios
```

### EAS Build Configuration

Make sure `eas.json` includes the google services files:

```json
{
  "build": {
    "production": {
      "android": {
        "googleServicesFile": "./google-services.json"
      },
      "ios": {
        "googleServicesFile": "./GoogleService-Info.plist"
      }
    }
  }
}
```

## 🔍 Debugging

### Check if token is generated:
```javascript
import * as Notifications from 'expo-notifications';

const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-project-id',
});
console.log('Token:', token.data);
```

### Check notification permissions:
```javascript
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission status:', status);
```

### View logs:
```bash
# Android
npx expo run:android
# Then in another terminal:
adb logcat | grep -i "expo\|notification\|fcm"

# iOS
npx expo run:ios
# Check Xcode console
```

## 📚 Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)

## ⚠️ Troubleshooting

### "Token not generated"
- Make sure you're testing on a physical device (not simulator)
- Check if permissions are granted
- Verify `google-services.json` is in the correct location

### "Backend API error"
- Check if your backend endpoints are implemented
- Verify the API URL in `config/axios.tsx`
- Check network connectivity

### "Notifications not appearing"
- Check notification permissions in device settings
- Verify FCM is enabled in Firebase Console
- Check if Cloud Messaging API is enabled in Google Cloud Console

## 🎉 You're All Set!

Your app is now configured for push notifications! When Socket.IO events are received, users will see:
1. In-app notifications (when app is open)
2. Push notifications (when app is in background/closed)
3. Badge count updates
4. Notification list in the app

For any issues, check the Firebase Console logs and your app's console output.






