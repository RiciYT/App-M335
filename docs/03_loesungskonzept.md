# Lösungskonzept – Tilt Maze

## 1. Übersicht

Dieses Dokument beschreibt das technische Lösungskonzept für die App «Tilt Maze» – ein Geschicklichkeitsspiel, bei dem die Spielenden eine Kugel durch Neigen des Smartphones durch ein Labyrinth navigieren.

## 2. Framework und App-Typ

### 2.1 Verwendetes Framework

| Technologie | Version | Zweck |
|-------------|---------|-------|
| **React Native** | 0.81.5 | Plattformübergreifende App-Entwicklung |
| **Expo** | SDK 54 | Vereinfachter Zugriff auf Native APIs, Build-Prozess |
| **TypeScript** | 5.9.2 | Typsicherheit und bessere Entwicklererfahrung |
| **matter-js** | 0.20.0 | 2D-Physik-Engine für realistische Kugelbewegung |
| **Firebase** | 12.7.0 | Backend-Services (Auth, Database) |

### 2.2 App-Typ

**Hybrid-App (Cross-Platform)**

React Native kompiliert JavaScript/TypeScript-Code in native Komponenten, was folgende Vorteile bietet:

- **Eine Codebasis** für Android und iOS
- **Nativer Look & Feel** durch native UI-Komponenten
- **Schnelle Entwicklung** durch Hot Reloading
- **Expo-Ökosystem** für einfachen Zugriff auf Sensoren und Build-Tools

## 3. Architektur-Überblick

### 3.1 Projektstruktur

```
App-M335/
├── App.tsx                      # Hauptkomponente, Navigation, Auth-State
├── src/
│   ├── config/
│   │   ├── firebase.ts          # Firebase-Initialisierung
│   │   └── tiltControls.ts      # Steuerungskonfiguration
│   ├── input/
│   │   └── tiltInput.ts         # Accelerometer-Input-Verarbeitung
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Authentifizierung
│   │   ├── MenuScreen.tsx       # Hauptmenü
│   │   ├── GameScreen.tsx       # Spiellogik + Physik
│   │   ├── ResultScreen.tsx     # Ergebnis + Speicherung
│   │   ├── HighscoresScreen.tsx # Bestenliste
│   │   └── SettingsScreen.tsx   # App-Einstellungen
│   ├── hooks/
│   │   └── useAppSettings.ts    # Settings-Hook
│   ├── components/
│   │   └── ui/                  # Wiederverwendbare UI-Komponenten
│   ├── theme/                   # Styling-Konstanten
│   └── types/
│       └── index.ts             # TypeScript-Typdefinitionen
├── assets/                      # Bilder, Sounds
├── docs/                        # Dokumentation
├── app.json                     # Expo-Konfiguration
├── eas.json                     # EAS Build-Konfiguration
└── package.json                 # Abhängigkeiten
```

### 3.2 Komponentenhierarchie

```
App (Root)
│
├─ LoginScreen
│  └─ Google Sign-In Button
│
├─ MenuScreen
│  ├─ Welcome + Nickname
│  ├─ Play Button → GameScreen
│  ├─ Highscores Button → HighscoresScreen
│  └─ Logout Button → LoginScreen
│
├─ GameScreen
│  ├─ HUD (Timer, Back-Button)
│  ├─ Game Area
│  │  ├─ Ball (physics body)
│  │  ├─ Target (sensor body)
│  │  └─ Maze Walls (static bodies)
│  └─ Settings Modal
│
├─ ResultScreen
│  ├─ Zeit-Anzeige
│  ├─ Speicherstatus
│  └─ Navigation-Buttons
│
└─ HighscoresScreen
   └─ FlatList mit Top 10
```

## 4. Sensor-Nutzung

### 4.1 Accelerometer (Sensor 1)

#### Verwendungszweck
Der Beschleunigungssensor erfasst die Neigung des Geräts in 3 Achsen (x, y, z). Für das 2D-Spiel werden nur x- und y-Achse verwendet.

#### Technische Umsetzung

**Datei:** `src/input/tiltInput.ts`

```typescript
import { Accelerometer } from 'expo-sensors';

// Sensor-Listener starten
export function startTilt(config: TiltConfig) {
  Accelerometer.setUpdateInterval(config.updateInterval); // 50ms
  
  subscription = Accelerometer.addListener((data) => {
    const { x, y } = data;
    
    // Tiefpassfilter für Glättung
    smoothedX = config.smoothingAlpha * x + (1 - alpha) * smoothedX;
    smoothedY = config.smoothingAlpha * y + (1 - alpha) * smoothedY;
    
    // Deadzone (kleine Bewegungen ignorieren)
    if (Math.abs(smoothedX) < config.deadzone) smoothedX = 0;
    if (Math.abs(smoothedY) < config.deadzone) smoothedY = 0;
    
    // Optional: Invertierung
    if (config.invertX) smoothedX = -smoothedX;
    
    // Werte für Physik-Engine bereitstellen
    currentTilt = { x: smoothedX, y: smoothedY };
  });
}
```

**Datei:** `src/screens/GameScreen.tsx`

```typescript
// In der Game-Loop: Physik-Engine mit Neigungswerten aktualisieren
const tiltX = getTiltX();
const force = tiltX * sensitivity * 0.0015;
Matter.Body.applyForce(ball, ball.position, { x: force, y: 0 });
```

#### Konfigurationsparameter

| Parameter | Standardwert | Beschreibung |
|-----------|--------------|--------------|
| `updateInterval` | 50ms | Abtastrate des Sensors |
| `deadzone` | 0.05 | Schwelle für minimale Bewegung |
| `smoothingAlpha` | 0.3 | Glättungsfaktor (0–1) |
| `sensitivity` | 1.0 | Multiplikator für Steuerungsempfindlichkeit |
| `invertX` | false | X-Achse invertieren |

### 4.2 Vibration (Aktor 1)

#### Verwendungszweck
Haptisches Feedback bei Spielereignissen (Kollisionen, Spielende).

#### Technische Umsetzung

**Datei:** `src/screens/GameScreen.tsx`

```typescript
import { Vibration } from 'react-native';

// Bei Kollision oder Spielende
if (vibrationEnabled) {
  Vibration.vibrate(100); // 100ms Vibration
}
```

## 5. Persistenz (Firebase Realtime Database)

### 5.1 Datenfluss

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (App)                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ResultScreen                    HighscoresScreen        │
│       │                               │                  │
│       │ saveScore()                   │ fetchHighscores()│
│       │                               │                  │
│       ▼                               ▼                  │
│   ┌───────────────────────────────────────────────┐     │
│   │              Firebase SDK                      │     │
│   │   set(), get(), ref(), onValue()              │     │
│   └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│               FIREBASE REALTIME DATABASE                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   users/                                                 │
│   └── {userId}/                                          │
│       └── nickname: "Spielername"                        │
│                                                          │
│   scores/                                                │
│   └── {userId}/                                          │
│       ├── userId: "abc123"                               │
│       ├── email: "user@example.com"                      │
│       ├── nickname: "Spielername"                        │
│       ├── time: 5420 (ms)                                │
│       └── timestamp: 1704902400000                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Gespeicherte Daten

| Pfad | Datentyp | Beschreibung |
|------|----------|--------------|
| `users/{uid}/nickname` | String | Spielername des Benutzers |
| `scores/{uid}/userId` | String | Firebase User ID |
| `scores/{uid}/email` | String | E-Mail-Adresse |
| `scores/{uid}/nickname` | String | Spielername (Kopie) |
| `scores/{uid}/time` | Number | Bestzeit in Millisekunden |
| `scores/{uid}/timestamp` | Number | Unix-Timestamp der Speicherung |

### 5.3 Datenbankoperationen

**Score speichern (ResultScreen.tsx):**

```typescript
const saveScore = async (time: number) => {
  const user = auth.currentUser;
  if (!user) return;

  // Bestehende Zeit prüfen
  const scoreRef = ref(database, `scores/${user.uid}`);
  const snapshot = await get(scoreRef);
  
  if (!snapshot.exists() || time < snapshot.val().time) {
    // Neue Bestzeit speichern
    await set(scoreRef, {
      userId: user.uid,
      email: user.email,
      nickname: nickname,
      time: time,
      timestamp: Date.now()
    });
    return true; // Neue Bestzeit
  }
  return false; // Keine neue Bestzeit
};
```

**Highscores laden (HighscoresScreen.tsx):**

```typescript
const fetchHighscores = async () => {
  const scoresRef = ref(database, 'scores');
  const snapshot = await get(scoresRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const scores = Object.values(data)
      .sort((a, b) => a.time - b.time) // Aufsteigend nach Zeit
      .slice(0, 10);                    // Top 10
    return scores;
  }
  return [];
};
```

## 6. Authentifizierung (Firebase Auth)

### 6.1 Ablaufdiagramm

```
┌──────────────────────────────────────────────────────────┐
│                      LOGIN-ABLAUF                         │
└──────────────────────────────────────────────────────────┘

         Benutzer öffnet App
                 │
                 ▼
       ┌─────────────────────┐
       │   LoginScreen       │
       │                     │
       │  [Google Sign-In]   │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │ Google OAuth 2.0    │
       │                     │
       │ • Konto auswählen   │
       │ • Zustimmen         │
       └──────────┬──────────┘
                  │
                  │ id_token
                  ▼
       ┌─────────────────────┐
       │ Firebase Auth       │
       │                     │
       │ signInWithCredential│
       └──────────┬──────────┘
                  │
                  │ onAuthStateChanged
                  ▼
       ┌─────────────────────┐
       │ App State Update    │
       │                     │
       │ user = firebaseUser │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   MenuScreen        │
       │                     │
       │ Willkommen, {Name}! │
       └─────────────────────┘
```

### 6.2 Implementierung

**Datei:** `src/screens/LoginScreen.tsx`

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Google Sign-In konfigurieren
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com'
});

// Login-Funktion
const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    
    if (response.data?.idToken) {
      const credential = GoogleAuthProvider.credential(response.data.idToken);
      await signInWithCredential(auth, credential);
      onLogin(); // Navigation zum Menü
    }
  } catch (error) {
    // Fehlerbehandlung
  }
};
```

**Datei:** `App.tsx` (Auth-State-Listener)

```typescript
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
      setCurrentScreen('Menu');
    } else {
      setUser(null);
      setCurrentScreen('Login');
    }
    setLoading(false);
  });
  
  return () => unsubscribe();
}, []);
```

### 6.3 Fehlerfälle

| Fehler | Ursache | Behandlung |
|--------|---------|------------|
| `auth/network-request-failed` | Keine Internetverbindung | Toast-Meldung anzeigen |
| `auth/cancelled-popup-request` | Benutzer bricht ab | Zurück zum Login-Screen |
| `auth/invalid-credential` | Ungültiges Token | Erneuter Login-Versuch |

## 7. Physik-Engine (matter-js)

### 7.1 Engine-Konfiguration

```typescript
// Engine ohne Standard-Gravitation erstellen
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 0, scale: 0.001 }
});

// Physik-Bodies erstellen
const ball = Matter.Bodies.circle(x, y, BALL_RADIUS, {
  restitution: 0.7,   // Abprall-Elastizität
  friction: 0.05,     // Reibung
  frictionAir: 0.02,  // Luftwiderstand
  label: 'ball'
});

const target = Matter.Bodies.circle(tx, ty, TARGET_RADIUS, {
  isStatic: true,
  isSensor: true,     // Nur Kollisionserkennung
  label: 'target'
});

// Kollisionserkennung
Matter.Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((pair) => {
    if (pair.bodyA.label === 'ball' && pair.bodyB.label === 'target') {
      setGameWon(true);
    }
  });
});
```

## 8. Hauptscreens und Komponenten

| Screen | Datei | Beschreibung |
|--------|-------|--------------|
| LoginScreen | `src/screens/LoginScreen.tsx` | Google Sign-In |
| MenuScreen | `src/screens/MenuScreen.tsx` | Hauptmenü, Nickname-Bearbeitung |
| GameScreen | `src/screens/GameScreen.tsx` | Spiellogik, Physik, Timer |
| ResultScreen | `src/screens/ResultScreen.tsx` | Ergebnisanzeige, Score-Speicherung |
| HighscoresScreen | `src/screens/HighscoresScreen.tsx` | Top 10 Bestenliste |
| SettingsScreen | `src/screens/SettingsScreen.tsx` | App-Einstellungen |

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335*
