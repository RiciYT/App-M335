# Testing Guide for Tilt Maze

## Prerequisites

Before testing, ensure you have:
1. Completed the Firebase setup (see FIREBASE_SETUP.md)
2. A physical Android device (recommended) or iOS device
3. Expo Go app installed on your device

## Running the App

### Option 1: Using Expo Go (Recommended for Testing)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - **Android**: Expo Go app
   - **iOS**: Camera app (which will open Expo Go)

### Option 2: Using Android Emulator

1. Set up Android Studio and create an emulator
2. Run:
   ```bash
   npm run android
   ```

**Note**: Accelerometer may not work properly on emulators. Physical device testing is strongly recommended.

## Testing Checklist

### 1. Authentication Tests

#### Test Case: Sign Up
- [ ] Open the app
- [ ] Enter a valid email and password
- [ ] Click "Sign Up"
- [ ] Verify successful registration and redirect to Menu screen
- [ ] Check Firebase Console > Authentication to confirm user was created

#### Test Case: Login
- [ ] Logout from Menu screen
- [ ] Enter the same email and password
- [ ] Click "Login"
- [ ] Verify successful login and redirect to Menu screen

#### Test Case: Invalid Email
- [ ] Try signing up with invalid email format (e.g., "notanemail")
- [ ] Verify error message is displayed

#### Test Case: Weak Password
- [ ] Try signing up with password less than 6 characters
- [ ] Verify error message is displayed

### 2. Navigation Tests

#### Test Case: Menu Navigation
- [ ] From Menu, click "Play Game"
- [ ] Verify Game screen loads
- [ ] Click "Back" button
- [ ] Verify return to Menu screen

#### Test Case: Highscores Navigation
- [ ] From Menu, click "Highscores"
- [ ] Verify Highscores screen loads
- [ ] Click "Back" button
- [ ] Verify return to Menu screen

### 3. Game Mechanics Tests

#### Test Case: Ball Movement
- [ ] Start a game
- [ ] Tilt device left - ball should move left
- [ ] Tilt device right - ball should move right
- [ ] Tilt device forward - ball should move up
- [ ] Tilt device backward - ball should move down

#### Test Case: Boundary Collision
- [ ] Move ball to each edge of the screen
- [ ] Verify ball bounces back from edges
- [ ] Verify ball cannot go off-screen

#### Test Case: Timer
- [ ] Start a game
- [ ] Verify timer starts at 0.00s
- [ ] Verify timer continuously updates
- [ ] Complete the game
- [ ] Verify final time is displayed

#### Test Case: Target Collision
- [ ] Move ball into the green target area
- [ ] Verify "You Won!" message appears
- [ ] Verify automatic transition to Result screen after ~0.5 seconds

### 4. Score Saving Tests

#### Test Case: First Score Save
- [ ] Complete a game (note the time)
- [ ] Verify "Saving score..." indicator appears
- [ ] Verify "New Personal Best!" message appears
- [ ] Check Firebase Console > Realtime Database to confirm score was saved

#### Test Case: Better Score
- [ ] Play again and complete with a faster time
- [ ] Verify "New Personal Best!" message appears
- [ ] Check Firebase Console to confirm score was updated

#### Test Case: Slower Score
- [ ] Play again and complete with a slower time
- [ ] Verify message indicates to keep practicing
- [ ] Check Firebase Console to confirm old score remains unchanged

### 5. Result Screen Tests

#### Test Case: Result Display
- [ ] Complete a game
- [ ] Verify correct time is displayed
- [ ] Verify "Play Again" button works
- [ ] Verify "View Highscores" button works
- [ ] Verify "Back to Menu" button works

### 6. Highscores Tests

#### Test Case: Empty Highscores
- [ ] With a fresh Firebase database (no scores)
- [ ] View Highscores screen
- [ ] Verify "No scores yet!" message appears

#### Test Case: Multiple Scores
- [ ] Have multiple users complete games
- [ ] View Highscores screen
- [ ] Verify scores are sorted by time (fastest first)
- [ ] Verify top 10 scores are displayed
- [ ] Verify top 3 have colored backgrounds (gold, silver, bronze)

#### Test Case: Score Format
- [ ] Verify times are displayed as "X.XXs" format
- [ ] Verify user emails are displayed
- [ ] Verify rank numbers are displayed (#1, #2, etc.)

### 7. Logout Tests

#### Test Case: Successful Logout
- [ ] From Menu screen, click "Logout"
- [ ] Verify redirect to Login screen
- [ ] Verify cannot access Menu without logging back in

## Performance Tests

### Test Case: Smooth Animation
- [ ] Play game for 30+ seconds
- [ ] Verify ball movement is smooth (no lag)
- [ ] Verify no performance degradation over time

### Test Case: Firebase Response Time
- [ ] Complete a game
- [ ] Time how long it takes to save score
- [ ] Should complete within 2-3 seconds normally

## Edge Cases

### Test Case: Rapid Device Tilting
- [ ] Shake device rapidly while playing
- [ ] Verify ball doesn't glitch or disappear
- [ ] Verify game remains stable

### Test Case: Background/Foreground
- [ ] Start a game
- [ ] Put app in background (home button)
- [ ] Return to app
- [ ] Verify game state is maintained or resets gracefully

### Test Case: No Internet Connection
- [ ] Disable device internet
- [ ] Try to login
- [ ] Verify appropriate error message
- [ ] Enable internet and verify can login

## Bug Reporting

If you find a bug:
1. Note the device and OS version
2. Document steps to reproduce
3. Take screenshots if applicable
4. Check Firebase Console for errors
5. Check device logs with `npx expo start` and look for errors in terminal

## Known Limitations

1. **Web Support**: Accelerometer doesn't work on web browsers
2. **Emulators**: Sensor simulation may not work perfectly
3. **Physics**: Ball behavior is simplified, not a full physics engine
4. **Firebase Rules**: Default rules are permissive for testing

## Next Steps After Testing

1. Fix any bugs found
2. Set up production Firebase security rules
3. Add error boundaries for better error handling
4. Consider adding analytics
5. Prepare for app store submission

## Test Results Template

```
Date: ___________
Tester: ___________
Device: ___________
OS Version: ___________

Authentication: ✓ / ✗
Navigation: ✓ / ✗
Game Mechanics: ✓ / ✗
Score Saving: ✓ / ✗
Highscores: ✓ / ✗
Logout: ✓ / ✗

Issues Found:
1. 
2. 
3. 

Notes:

```
