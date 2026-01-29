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
Der Beschleunigungssensor erfasst die Beschleunigung des Geräts auf der X-Achse. Nur die X-Achse wird für die horizontale Kugelsteuerung verwendet. Die Y-Achse (vertikale Gravitation) ist konstant und wird NICHT vom Sensor beeinflusst.

#### Technische Umsetzung

**Datei:** `src/hooks/useTiltControl.ts`

```typescript
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';

// Sensor-Listener starten
Accelerometer.setUpdateInterval(settings.updateInterval); // 16ms (60 FPS)

subscriptionRef.current = Accelerometer.addListener((data: AccelerometerMeasurement) => {
  const { x } = data; // NUR X-Achse wird verwendet
  
  // Low-pass filter für Glättung
  smoothedXRef.current = lerp(smoothedXRef.current, x, smoothingAlpha);
  
  // Deadzone anwenden
  let filteredX = applyDeadzone(smoothedXRef.current, deadzone);
  
  // Optional: Invertierung
  if (invertX) filteredX = -filteredX;
  
  // Horizontal gravity setzen (X-Achse)
  engine.gravity.x = filteredX * sensitivity;
  // Y-Gravitation bleibt konstant: engine.gravity.y = CONSTANT_GRAVITY_Y
});
```

#### Konfigurationsparameter

| Parameter | Standardwert | Beschreibung |
|-----------|--------------|--------------|
| `updateInterval` | 16ms | Abtastrate des Sensors (60 FPS) |
| `deadzone` | 0.02 | Schwelle für minimale Bewegung |
| `smoothingAlpha` | 0.3 | Glättungsfaktor (0–1) |
| `sensitivity` | 1.0 | Multiplikator für Steuerungsempfindlichkeit |
| `invertX` | false | X-Achse invertieren |

### 4.2 DeviceMotion (Sensor 2)

#### Verwendungszweck
DeviceMotion erfasst die Geräterotation (gamma-Winkel) für präzisere Neigungssteuerung und ermöglicht die Kalibrierung des Nullpunkts.

#### Technische Umsetzung

**Datei:** `src/input/tiltInput.ts`

```typescript
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';

DeviceMotion.setUpdateInterval(16); // 60 FPS

subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
  const rotation = data.rotation;
  if (!rotation) return;
  
  // gamma = links-rechts Neigung in Radians (-π bis π)
  const maxTiltAngle = Math.PI / 4; // 45 Grad
  let tiltValue = rotation.gamma / maxTiltAngle;
  
  // Kalibrierungsoffset anwenden
  tiltValue -= calibrationOffset;
  
  // Clamp auf -1 bis 1
  tiltValue = clamp(tiltValue, -1, 1);
  
  // Deadzone und Response Curve
  let processed = applyDeadzone(tiltValue, deadzone);
  processed = applyResponseCurve(processed, curvePower); // Power 1.5
  
  // Smoothing
  smoothedTiltX = lerp(smoothedTiltX, processed, smoothingAlpha);
});
```

**Kalibrierungsfunktion:**
```typescript
export function calibrateTilt(): void {
  calibrationOffset = rawTiltX; // Aktuellen Winkel als Nullpunkt setzen
  smoothedTiltX = 0;
}
```

### 4.3 Vibration (Aktor 1)

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

**Steuerung:** Ein-/Ausschaltbar in SettingsScreen über AsyncStorage.

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
  webClientId: '205887865955-vh3dhhluv4a1i65ku62tfdlstkctcja9.apps.googleusercontent.com'
});

// Google Sign-In (einzige implementierte Methode)
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
