# Tilt Maze - Architecture Documentation

## Application Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────┐
│                   App.tsx                       │
│  (Main Component - Navigation & Auth State)     │
└──────────────┬──────────────────────────────────┘
               │
               ├─── Firebase Auth State Listener
               │
        ┌──────┴──────┐
        │             │
    Logged Out    Logged In
        │             │
        ▼             ▼
   LoginScreen    MenuScreen
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   GameScreen   HighscoresScreen  Logout
        │
        └──> ResultScreen
```

### Component Hierarchy
```
App (Root)
│
├─ LoginScreen
│  ├─ TextInput (email)
│  ├─ TextInput (password)
│  ├─ Button (Login)
│  └─ Button (Sign Up)
│
├─ MenuScreen
│  ├─ Button (Play Game)
│  ├─ Button (Highscores)
│  └─ Button (Logout)
│
├─ GameScreen
│  ├─ Header
│  │  ├─ Back Button
│  │  └─ Timer Display
│  ├─ Game Area
│  │  ├─ Ball (animated)
│  │  ├─ Target (green hole)
│  │  └─ Win Message (conditional)
│  └─ Instructions
│
├─ ResultScreen
│  ├─ Time Display
│  ├─ Save Status (loading/best/not best)
│  ├─ Button (Play Again)
│  ├─ Button (View Highscores)
│  └─ Button (Back to Menu)
│
└─ HighscoresScreen
   ├─ Header (with Back Button)
   └─ FlatList (Top 10 Scores)
      └─ ScoreItem (rank, email, time)
```

## Data Flow

### Authentication Flow
```
User Input (email/password)
    │
    ▼
Firebase Auth API
    │
    ├─ Success ──> onAuthStateChanged
    │              │
    │              ▼
    │          Update App State
    │              │
    │              ▼
    │          Navigate to Menu
    │
    └─ Error ──> Display Alert
```

### Game Play Flow
```
User Tilts Device
    │
    ▼
Accelerometer Sensor
    │
    ▼
Update Ball Velocity
    │
    ▼
Calculate New Position
    │
    ├─ Check Wall Collision ──> Bounce
    │
    └─ Check Target Collision ──> Win!
           │
           ▼
       Stop Timer
           │
           ▼
    Navigate to Result
```

### Score Saving Flow
```
Game Complete (time recorded)
    │
    ▼
Result Screen Mounted
    │
    ▼
Fetch Current Best Time
    │
    ├─ No existing score ──┐
    │                      │
    └─ Has existing score  │
           │               │
           ▼               ▼
    Compare Times     Save New Score
           │               │
    ├─ Slower ──> Skip    │
    │                     │
    └─ Faster ──> Save    │
                          ▼
                  Update Firebase
                          │
                          ▼
                  Show Success/Best
```

### Highscores Loading Flow
```
Highscores Screen Mounted
    │
    ▼
Firebase Database Query
    │
    ▼
Fetch All Scores
    │
    ▼
Sort by Time (ascending)
    │
    ▼
Take Top 10
    │
    ▼
Display in List
```

## State Management

### App-Level State (App.tsx)
```typescript
- user: User | null              // Current authenticated user
- loading: boolean               // Initial auth check
- currentScreen: Screen          // Active screen name
- gameTime: number               // Last game completion time
```

### Screen-Level State

#### LoginScreen
```typescript
- email: string
- password: string
- loading: boolean
```

#### GameScreen
```typescript
- ball: Ball { x, y, vx, vy }
- target: Target { x, y, radius }
- startTime: number
- elapsedTime: number
- gameWon: boolean
```

#### ResultScreen
```typescript
- saving: boolean
- saved: boolean
- isNewBest: boolean
```

#### HighscoresScreen
```typescript
- scores: GameScore[]
- loading: boolean
```

## Firebase Integration

### Authentication
```
Firebase Auth Module
│
├─ signInWithEmailAndPassword()
├─ createUserWithEmailAndPassword()
├─ signOut()
└─ onAuthStateChanged()
```

### Database Structure
```
firebase-database/
└─ scores/
   ├─ userId1/
   │  ├─ userId: "abc123"
   │  ├─ email: "user1@example.com"
   │  ├─ time: 5420
   │  └─ timestamp: 1704902400000
   │
   └─ userId2/
      ├─ userId: "xyz789"
      ├─ email: "user2@example.com"
      ├─ time: 6150
      └─ timestamp: 1704902500000
```

### Database Operations
```
Write Operations:
- set(ref(database, `scores/${userId}`), scoreData)

Read Operations:
- get(ref(database, 'scores'))
- get(ref(database, `scores/${userId}`))
```

## Physics Engine

### Ball Movement Calculation
```
1. Get Accelerometer Data
   ├─ x: left/right tilt
   └─ y: forward/backward tilt

2. Update Velocity
   vx += x * SENSITIVITY
   vy -= y * SENSITIVITY  // Inverted Y

3. Apply Friction
   vx *= FRICTION (0.95)
   vy *= FRICTION (0.95)

4. Update Position
   x += vx
   y += vy

5. Check Boundaries
   if (x < BALL_RADIUS) → bounce
   if (x > SCREEN_WIDTH) → bounce
   if (y < BALL_RADIUS) → bounce
   if (y > SCREEN_HEIGHT) → bounce

6. Check Target Collision
   distance = sqrt((ball.x - target.x)² + (ball.y - target.y)²)
   if (distance < BALL_RADIUS + TARGET_RADIUS) → WIN!
```

### Constants
```typescript
BALL_RADIUS = 15        // Ball size
TARGET_RADIUS = 30      // Target size
FRICTION = 0.95         // Velocity damping
SENSITIVITY = 20        // Accelerometer multiplier
UPDATE_RATE = 16ms      // ~60fps
```

## Navigation System

### Simple State-Based Navigation
```typescript
type Screen = 'Login' | 'Menu' | 'Game' | 'Result' | 'Highscores'

Navigation Methods:
- setCurrentScreen(screen: Screen)
- onNavigate(screen: string)
- onBack() → previous screen
- onLogin() → Menu
- onLogout() → Login
- onGameComplete(time) → Result
```

### Screen Transitions
```
Login ←→ Menu ←→ Game → Result
              ↓           ↓
         Highscores ←─────┘
```

## Error Handling

### Authentication Errors
```
try {
  await signInWithEmailAndPassword(...)
} catch (error) {
  Alert.alert('Login Error', error.message)
}
```

### Database Errors
```
try {
  await set(ref(...), data)
} catch (error) {
  Alert.alert('Error', 'Failed to save score')
}
```

### Sensor Errors
```
- Accelerometer not available → Continue without sensors
- Permission denied → Request permission
- Update failed → Log error, continue
```

## Performance Optimizations

### Rendering
- Use `useState` for local component state
- `useEffect` for side effects only
- Avoid unnecessary re-renders
- Memoize expensive calculations

### Physics Loop
- 60fps update rate (16ms)
- Efficient position calculations
- Minimal state updates
- Cancel subscriptions on unmount

### Firebase
- Batch reads when possible
- Cache user's best time
- Limit highscores to top 10
- Index on time for sorting

## Security Considerations

### Current Implementation
- Client-side authentication
- Public read access to scores
- User-restricted writes
- No sensitive data in code

### Production Recommendations
```json
// Firebase Realtime Database Rules
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

## Technology Stack Summary

```
┌─────────────────────────────────────┐
│     React Native (JavaScript)       │
│  ┌───────────────────────────────┐  │
│  │      TypeScript Layer          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      Expo Framework            │  │
│  │  - Sensors API                 │  │
│  │  - Status Bar                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     Firebase Services               │
│  ┌───────────────────────────────┐  │
│  │   Authentication (Email/Pass)  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   Realtime Database (NoSQL)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Development Workflow

```
1. Write TypeScript Code
   │
   ▼
2. Type Check (tsc --noEmit)
   │
   ▼
3. Start Expo Server (npm start)
   │
   ▼
4. Test on Device (Expo Go)
   │
   ▼
5. Debug & Iterate
   │
   ▼
6. Build for Production (EAS)
```

## File Organization Rationale

```
src/
├── config/       # External service configuration
├── screens/      # Full-screen components
├── types/        # TypeScript type definitions
└── components/   # Reusable components (future)
```

## Future Architecture Enhancements

### Potential Improvements
1. **React Navigation**: Replace state-based navigation
2. **Redux/Context**: Global state management
3. **Custom Hooks**: Reusable logic (useTimer, usePhysics)
4. **Component Library**: Shared UI components
5. **Services Layer**: Abstract Firebase operations
6. **Utils**: Helper functions (formatTime, etc.)
7. **Constants**: Centralized configuration
8. **Tests**: Unit and integration tests

### Scalability Considerations
- Add more game levels → Level selector
- Multiple game modes → Mode configuration
- Achievements → Achievement system
- Social features → Friend system
- Leaderboards by category → Filtered queries

---

This architecture provides a solid foundation for the Tilt Maze game while remaining simple enough for easy understanding and maintenance.
