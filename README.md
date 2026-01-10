# Tilt Maze

A React Native game built with Expo where you control a ball by tilting your device using the gyroscope/accelerometer. Navigate through a maze, guide the ball to the target hole, and compete for the best time!

## Features

- **Physics Engine**: Uses matter-js for realistic 2D physics (ball, walls, collisions)
- **Device Motion Control**: Tilt your device to control the ball via accelerometer
- **Firebase Authentication**: Multiple login options:
  - Google Sign-In
  - Anonymous login
  - **Guest Mode**: Play without any login (scores not saved)
- **Nickname System**: Logged-in users can set a display name
- **Firebase Realtime Database**: Store and retrieve best times for logged-in users
- **Highscores**: View top 10 fastest times globally
- **Multiple Screens**: Login, Menu, Game, Result, and Highscores

## Technologies Used

- React Native with Expo
- TypeScript
- matter-js (2D physics engine)
- Firebase Authentication (Google, Anonymous)
- Firebase Realtime Database
- Expo Sensors (Accelerometer)
- Expo Auth Session (Google Sign-In)
- React Hooks

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication methods:
   - Go to Authentication > Sign-in method
   - Enable **Anonymous**
   - Enable **Google** (for Google Sign-In)
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

6. For Google Sign-In, update `src/screens/LoginScreen.tsx` with your Google Client IDs.

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

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

1. **Choose Your Mode**: 
   - Play as Guest (scores not saved)
   - Sign in with Google
   - Login anonymously
   - Use email/password
2. **Set Nickname** (optional, logged-in users only)
3. **Play Game**: From the menu, tap "Play Game"
4. **Tilt to Control**: Tilt your device to move the blue ball
5. **Navigate the Maze**: Avoid walls and find your way through
6. **Reach the Target**: Guide the ball into the green target hole
7. **Beat Your Time**: Try to complete the game as fast as possible
8. **View Highscores**: Check out the top 10 fastest times

## Project Structure

```
App-M335/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── config/
│   │   └── firebase.ts     # Firebase configuration
│   ├── screens/
│   │   ├── LoginScreen.tsx    # Login/Signup/Guest screen
│   │   ├── MenuScreen.tsx     # Main menu with nickname
│   │   ├── GameScreen.tsx     # Game with matter-js physics
│   │   ├── ResultScreen.tsx   # Post-game results
│   │   └── HighscoresScreen.tsx  # Top scores
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── app.json               # Expo configuration
└── package.json          # Dependencies
```

## Game Mechanics

- Ball is controlled by device accelerometer
- Uses matter-js physics engine for realistic movement
- Maze walls create obstacles to navigate around
- Physics include velocity, friction, restitution (bounce), and collision
- Timer starts when game begins
- Game completes when ball reaches target
- Best time per user is saved to Firebase (logged-in users only)
- Only personal bests are stored (overwrites if improved)

## Firebase Database Structure

```
users/
  └── userId/
      └── nickname: "CoolPlayer"

scores/
  ├── userId1/
  │   ├── userId: "userId1"
  │   ├── email: "user@example.com"
  │   ├── nickname: "CoolPlayer"
  │   ├── time: 5420
  │   └── timestamp: 1704902400000
  └── userId2/
      └── ...
```

## License

MIT