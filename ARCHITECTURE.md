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
               │    (Guest Mode Support)
               │
         ┌─────┼──────┬─────────┐
         │     │      │         │
     Guest  Anonymous  Google   Email
         │     │      │         │
         └─────┴──────┴─────────┘
                   │
                   ▼
              MenuScreen
                   │
      ┌────────────┼─────────────┐
      │            │             │
      ▼            ▼             ▼
 GameScreen  HighscoresScreen  Logout
      │
      └──> ResultScreen
```

### Component Hierarchy
```
App (Root)
│
├─ LoginScreen
│  ├─ Button (Play as Guest)
│  ├─ Button (Google Sign-In)
│  ├─ Button (Anonymous Login)
│  ├─ TextInput (email)
│  ├─ TextInput (password)
│  ├─ Button (Login)
│  └─ Button (Sign Up)
│
├─ MenuScreen
│  ├─ Welcome Message (with nickname/email)
│  ├─ Guest Warning (if guest)
│  ├─ Nickname Editor (if logged in)
│  ├─ Button (Play Game)
│  ├─ Button (Highscores)
│  └─ Button (Logout/Back)
│
├─ GameScreen (matter-js physics)
│  ├─ Header
│  │  ├─ Back Button
│  │  └─ Timer Display
│  ├─ Game Area
│  │  ├─ Ball (physics body)
│  │  ├─ Maze Walls (physics bodies)
│  │  ├─ Target (sensor body)
│  │  └─ Win Message (conditional)
│  └─ Instructions
│
├─ ResultScreen
│  ├─ Time Display
│  ├─ Guest Warning (if guest)
│  ├─ Save Status (loading/best/not best - logged in only)
│  ├─ Button (Play Again)
│  ├─ Button (View Highscores)
│  └─ Button (Back to Menu)
│
└─ HighscoresScreen
   ├─ Header (with Back Button)
   └─ FlatList (Top 10 Scores)
      └─ ScoreItem (rank, nickname, time)
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
├─ signInAnonymously()
├─ signInWithCredential() (Google)
├─ signOut()
└─ onAuthStateChanged()
```

### Database Structure
```
firebase-database/
├─ users/
│  ├─ userId1/
│  │  └─ nickname: "CoolPlayer"
│  └─ userId2/
│     └─ nickname: "ProGamer"
│
└─ scores/
   ├─ userId1/
   │  ├─ userId: "abc123"
   │  ├─ email: "user1@example.com"
   │  ├─ nickname: "CoolPlayer"
   │  ├─ time: 5420
   │  └─ timestamp: 1704902400000
   │
   └─ userId2/
      ├─ userId: "xyz789"
      ├─ email: "user2@example.com"
      ├─ nickname: "ProGamer"
      ├─ time: 6150
      └─ timestamp: 1704902500000
```

### Database Operations
```
Write Operations:
- set(ref(database, `users/${userId}/nickname`), nickname)
- set(ref(database, `scores/${userId}`), scoreData)

Read Operations:
- get(ref(database, 'scores'))
- get(ref(database, `scores/${userId}`))
- get(ref(database, `users/${userId}/nickname`))
```

## Physics Engine (matter-js)

### Matter.js Integration
```
1. Create Engine
   engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } })

2. Create Bodies
   ├─ Ball: Matter.Bodies.circle() - dynamic body
   ├─ Target: Matter.Bodies.circle() - static sensor
   └─ Walls: Matter.Bodies.rectangle() - static bodies

3. Add to World
   Matter.Composite.add(engine.world, [ball, target, ...walls])

4. Apply Forces (from accelerometer)
   Matter.Body.applyForce(ball, position, { x, y })

5. Collision Detection
   Matter.Events.on(engine, 'collisionStart', callback)

6. Run Physics Loop
   Matter.Runner.run(runner, engine)
```

### Ball Movement with matter-js
```
1. Get Accelerometer Data
   ├─ x: left/right tilt
   └─ y: forward/backward tilt

2. Apply Force to Ball
   forceMagnitude = 0.0015
   Matter.Body.applyForce(ball, ball.position, {
     x: x * forceMagnitude,
     y: -y * forceMagnitude  // Inverted Y
   })

3. Physics Engine Handles:
   - Velocity updates
   - Friction
   - Collision detection with walls
   - Bouncing (restitution)
```

### Constants
```typescript
BALL_RADIUS = 15          // Ball size
TARGET_RADIUS = 30        // Target size
WALL_THICKNESS = 20       // Wall thickness
FORCE_MAGNITUDE = 0.0015  // Accelerometer force multiplier
UPDATE_RATE = 16ms        // ~60fps

// Matter.js body properties
RESTITUTION = 0.7         // Bounciness
FRICTION = 0.05           // Surface friction
FRICTION_AIR = 0.02       // Air resistance
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
- onGuestPlay() → Menu (guest mode)
- onLogout() → Login
- onGameComplete(time) → Result
```

### Screen Transitions
```
Login (Guest/Anonymous/Google/Email)
         │
         ▼
      Menu ←→ Highscores
         │
         ▼
       Game
         │
         ▼
      Result
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
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
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
│  │  - expo-sensors (Accelerometer)│  │
│  │  - expo-auth-session (Google)  │  │
│  │  - expo-web-browser            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │      matter-js (2D Physics)    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     Firebase Services               │
│  ┌───────────────────────────────┐  │
│  │   Authentication               │  │
│  │   - Email/Password             │  │
│  │   - Google Sign-In             │  │
│  │   - Anonymous                  │  │
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
