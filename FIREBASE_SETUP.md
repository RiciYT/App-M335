# Firebase Setup Guide for Tilt Maze

This guide will walk you through setting up Firebase for the Tilt Maze app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "TiltMaze")
4. Accept the Firebase terms
5. Decide if you want Google Analytics (optional)
6. Click "Create project"

## Step 2: Register Your App

1. In the Firebase Console, click the Web icon (</>) to add a web app
2. Register app with a nickname (e.g., "Tilt Maze App")
3. You don't need to set up Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration object that appears

## Step 3: Enable Email/Password Authentication

1. In the left sidebar, click "Authentication"
2. Click "Get started" if you haven't used Authentication before
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

## Step 4: Create Realtime Database

1. In the left sidebar, click "Realtime Database"
2. Click "Create Database"
3. Choose a database location (closest to your users)
4. Start in **test mode** for development (you can set up security rules later)
5. Click "Enable"

**Important**: Your database URL will be shown at the top of the page. It looks like:
```
https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com
```

## Step 5: Set Up Security Rules (Optional but Recommended)

For production, you should secure your database. Here are recommended rules:

1. In Realtime Database, go to the "Rules" tab
2. Replace the existing rules with:

```json
{
  "rules": {
    "scores": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

This ensures:
- Anyone can read all scores (for highscores)
- Users can only write their own score

3. Click "Publish"

## Step 6: Update Your App Configuration

1. Open `src/config/firebase.ts` in your project
2. Replace the placeholder values with your Firebase configuration:

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

Example with real (but fake) values:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO2Pq",
  authDomain: "tiltmaze-12345.firebaseapp.com",
  databaseURL: "https://tiltmaze-12345-default-rtdb.firebaseio.com",
  projectId: "tiltmaze-12345",
  storageBucket: "tiltmaze-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};
```

## Step 7: Test Your Setup

1. Run your app: `npm start`
2. Try to sign up with a test email and password
3. Play the game and complete it
4. Check your Firebase Console:
   - Go to Authentication to see the registered user
   - Go to Realtime Database to see the score data

## Troubleshooting

### Authentication Errors
- **"auth/operation-not-allowed"**: Make sure Email/Password is enabled in Firebase Console
- **"auth/invalid-email"**: Check that you're using a valid email format
- **"auth/weak-password"**: Password must be at least 6 characters

### Database Errors
- **"PERMISSION_DENIED"**: Check your database security rules
- **"Database URL not found"**: Make sure you've included the `databaseURL` in your config

### App Errors
- **"Cannot find module 'firebase'"**: Run `npm install` to install dependencies
- **"Accelerometer not available"**: Make sure you're testing on a physical device, not an emulator

## Security Best Practices

1. **Never commit your Firebase config with real keys to public repositories**
2. Use environment variables for production
3. Set up proper security rules before deploying to production
4. Enable App Check to prevent abuse
5. Monitor your Firebase usage in the console

## Database Structure

Your database will have this structure:

```
scores/
  └── <userId>/
      ├── userId: "abc123..."
      ├── email: "user@example.com"
      ├── time: 5420 (milliseconds)
      └── timestamp: 1704902400000
```

Each user has one entry with their best time. When they beat their time, it gets updated.

## Next Steps

After setup:
1. Test the app thoroughly
2. Invite friends to compete on the highscores
3. Consider adding more features like achievements or different levels
4. Set up proper security rules for production

For more information, visit the [Firebase Documentation](https://firebase.google.com/docs).
