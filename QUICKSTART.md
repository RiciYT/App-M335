# Quick Start Guide

Get up and running with Tilt Maze in just a few minutes!

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase (Required)
Follow the detailed guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to:
- Create a Firebase project
- Enable Email/Password authentication
- Create a Realtime Database
- Get your configuration keys

### 3. Configure Firebase
Edit `src/config/firebase.ts` and replace with your Firebase config:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run the App
```bash
npm start
```

Then:
- **Android**: Scan QR code with Expo Go app
- **iOS**: Scan QR code with Camera app

## 📱 Testing on Physical Device (Recommended)

The game requires device motion sensors, so testing on a physical device is essential:

1. Install Expo Go from your app store:
   - [Expo Go for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Expo Go for iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Make sure your phone and computer are on the same WiFi network

3. Run `npm start` on your computer

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## 🎮 How to Play

1. **Sign Up / Login**: Create an account or log in
2. **Play Game**: Tilt your device to move the ball
3. **Goal**: Guide the ball into the green target as fast as possible
4. **Compete**: Beat your best time and climb the leaderboard!

## 🐛 Common Issues

### "Firebase Error: auth/operation-not-allowed"
- **Fix**: Enable Email/Password authentication in Firebase Console

### "Permission denied" error on database
- **Fix**: Set database rules to test mode in Firebase Console

### Accelerometer not working
- **Fix**: Use a physical device, not an emulator

### "Cannot connect to Metro"
- **Fix**: Ensure phone and computer are on same WiFi network

## 📚 Documentation

- [README.md](README.md) - Full project overview
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Detailed Firebase configuration
- [TESTING.md](TESTING.md) - Complete testing guide

## 🎯 Next Steps

1. ✅ Set up Firebase
2. ✅ Run the app on your device
3. ✅ Create an account
4. ✅ Play the game
5. ✅ Check out the highscores
6. 🎨 Customize the game (optional)
7. 📱 Build for production (optional)

## 💡 Tips

- **Best Performance**: Test on physical devices, not emulators
- **Easier Setup**: Use test mode for Firebase database initially
- **Testing**: Invite friends to compete on the leaderboard
- **Development**: Run `npx tsc --noEmit` to check for TypeScript errors

## 🔧 Build for Production

### Android APK
```bash
npx eas build --platform android --profile preview
```

### iOS IPA
```bash
npx eas build --platform ios --profile preview
```

Note: You'll need an Expo account. Run `npx eas login` first.

## 📞 Need Help?

- Check [TESTING.md](TESTING.md) for troubleshooting
- Review Firebase Console for authentication/database issues
- Check the terminal output for error messages
- Ensure all dependencies are installed: `npm install`

## 🎉 You're Ready!

Your Tilt Maze game should now be running. Have fun and happy tilting! 🎮
