# Tilt Maze

A React Native game built with Expo where you control a ball by tilting your device using the gyroscope/accelerometer. Guide the ball to the target hole and compete for the best time!

## Features

- **Device Motion Control**: Tilt your device to control the ball
- **Firebase Authentication**: Secure user login and signup
- **Firebase Realtime Database**: Store and retrieve best times per user
- **Highscores**: View top 10 fastest times globally
- **Multiple Screens**: Login, Menu, Game, Result, and Highscores

## Technologies Used

- React Native with Expo
- TypeScript
- Firebase Authentication
- Firebase Realtime Database
- Expo Sensors (Accelerometer)
- React Hooks

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
3. Create a **Realtime Database**:
   - Go to Realtime Database
   - Create database in test mode
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and add a web app
   - Copy the Firebase configuration object
5. Update `src/config/firebase.ts` with your Firebase configuration:

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

### 3. Run the App

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**For Web (limited functionality - no accelerometer):**
```bash
npm run web
```

## How to Play

1. **Login/Sign Up**: Create an account or log in with existing credentials
2. **Play Game**: From the menu, tap "Play Game"
3. **Tilt to Control**: Tilt your device to move the blue ball
4. **Reach the Target**: Guide the ball into the green target hole
5. **Beat Your Time**: Try to complete the game as fast as possible
6. **View Highscores**: Check out the top 10 fastest times

## Project Structure

```
App-M335/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── config/
│   │   └── firebase.ts     # Firebase configuration
│   ├── screens/
│   │   ├── LoginScreen.tsx    # Login/Signup screen
│   │   ├── MenuScreen.tsx     # Main menu
│   │   ├── GameScreen.tsx     # Game with ball physics
│   │   ├── ResultScreen.tsx   # Post-game results
│   │   └── HighscoresScreen.tsx  # Top scores
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── app.json               # Expo configuration
└── package.json          # Dependencies
```

## Game Mechanics

- Ball is controlled by device accelerometer
- Physics include velocity, friction, and boundary collision
- Timer starts when game begins
- Game completes when ball reaches target
- Best time per user is saved to Firebase
- Only personal bests are stored (overwrites if improved)

## Firebase Database Structure

```
scores/
  ├── userId1/
  │   ├── userId: "userId1"
  │   ├── email: "user@example.com"
  │   ├── time: 5420
  │   └── timestamp: 1704902400000
  └── userId2/
      └── ...
```

## License

MIT