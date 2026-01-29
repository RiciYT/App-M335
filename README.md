# Kompetenznachweis Modul 335 – Mobile Applikation realisieren

## Projektdokumentation: Tilt Maze

> **🎯 Abgabepaket:** Alle abgaberelevanten Dateien befinden sich im Ordner [`/deliverables`](./deliverables/). Siehe [README_ABGABE.md](./deliverables/README_ABGABE.md) für Details.

---

## 📦 Abgabe-Übersicht

| Deliverable | Status | Pfad |
|-------------|--------|------|
| **Dokumentation (PDF)** | ✅ | [`deliverables/dokumentation.pdf`](./deliverables/dokumentation.pdf) |
| **Projekt-ZIP** | ✅ | [`deliverables/project.zip`](./deliverables/project.zip) |
| **APK Build** | ✅ | [`deliverables/apk_link.txt`](./deliverables/apk_link.txt) |
| **Selbstbewertung** | ✅ | [`deliverables/selbstbewertung.xlsx`](./deliverables/selbstbewertung.xlsx) |
| **Quellcode** | ✅ | GitHub Repository |

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Aufgabe 1 – Anforderungen und Planung](#2-aufgabe-1--anforderungen-und-planung)
3. [Aufgabe 2 – Lösungskonzept](#3-aufgabe-2--lösungskonzept)
4. [Aufgabe 3 – Implementierung](#4-aufgabe-3--implementierung)
5. [Aufgabe 4 – Publikation](#5-aufgabe-4--publikation)
6. [Aufgabe 5 – Testdurchführung](#6-aufgabe-5--testdurchführung)

---

## 1. Projektübersicht

### Name der App

**Tilt Maze**

### Kurzbeschreibung der Idee

Tilt Maze ist ein interaktives Geschicklichkeitsspiel, bei dem die Spielenden eine Kugel durch Neigen des mobilen Geräts durch ein Labyrinth steuern. Das Ziel ist es, die Kugel möglichst schnell ins Zielfeld zu navigieren. Die App nutzt den Beschleunigungssensor des Geräts für eine intuitive Steuerung und speichert die Bestzeiten der angemeldeten Benutzer in einer Cloud-Datenbank.

### Ziel der App

- Bereitstellung eines unterhaltsamen Geschicklichkeitsspiels mit intuitiver Neigungssteuerung
- Nutzung von Gerätesensoren (Accelerometer) für die Spielsteuerung
- Implementierung eines Benutzerauthentifizierungssystems zur Identifikation der Spielenden
- Persistente Speicherung von Bestzeiten zur Förderung des Wettbewerbs unter den Nutzern
- Anzeige einer globalen Bestenliste (Top 10)

### Zielplattform

**Android** (primär), iOS (sekundär)

Die App wird mit React Native und Expo entwickelt, wodurch eine plattformübergreifende Kompatibilität gewährleistet ist. Der Fokus liegt jedoch auf der Android-Plattform.

---

## 2. Aufgabe 1 – Anforderungen und Planung

### 2.1 App-Idee und Planung

#### Beschreibung der App-Idee

Die App «Tilt Maze» kombiniert klassische Labyrinth-Spiele mit moderner Sensor-Technologie. Durch Neigen des Smartphones wird eine Kugel gesteuert, die physikalisch realistisch auf die Bewegungen reagiert. Die Spielenden müssen Hindernisse im Labyrinth umgehen und die Kugel so schnell wie möglich ins Zielfeld manövrieren. Ein Timer misst die benötigte Zeit, und die Bestzeiten werden für angemeldete Benutzer gespeichert.

#### Geplanter Ablauf der Screens (Storyboard)

| Screen | Beschreibung | Navigationsmöglichkeiten |
|--------|--------------|--------------------------|
| **LoginScreen** | Anmeldebildschirm mit Google-Login | → MenuScreen |
| **MenuScreen** | Hauptmenü mit Willkommensnachricht, Nickname-Bearbeitung und Navigation zu Spiel, Bestenliste oder Einstellungen | → GameScreen, → HighscoresScreen, → SettingsScreen |
| **GameScreen** | Spielbildschirm mit Labyrinth, beweglicher Kugel (Neigungssteuerung), Zielfeld und Timer | → ResultScreen (bei Spielende), → MenuScreen (Zurück) |
| **ResultScreen** | Ergebnisanzeige mit Zeit, Speicherstatus (neuer Rekord / nicht Rekord) und Optionen für erneutes Spielen | → GameScreen, → HighscoresScreen, → MenuScreen |
| **HighscoresScreen** | Bestenliste mit Top 10 Spielzeiten, sortiert nach kürzester Zeit | → MenuScreen |
| **SettingsScreen** | Einstellungen für Sound, Vibration, Tilt-Parameter und Logout | → MenuScreen |

#### Auflistung aller Funktionalitäten

1. **Benutzerauthentifizierung**
   - Google Sign-In (OAuth 2.0)
   - Logout-Funktion

2. **Spielfunktionen**
   - Kugelsteuerung durch Geräteneigung (Accelerometer + DeviceMotion)
   - Physik-Engine für realistische Kugelbewegung (matter-js)
   - Labyrinth mit Zick-Zack-Hindernissen (Wände)
   - Kollisionserkennung (Wände und Zielfeld)
   - Zeitmessung mit Millisekunden-Genauigkeit
   - Kalibrierbare Neigungssteuerung (Nullpunkt-Anpassung)
   - Einstellbare Steuerungsparameter (Sensitivität, Invert X, Deadzone, Glättung)
   - Haptisches Feedback (Vibration, ein-/ausschaltbar)
   - Hintergrundmusik (ein-/ausschaltbar)

3. **Datenspeicherung**
   - Speicherung der Bestzeiten in Firebase Realtime Database (`scores/{uid}`)
   - Nickname-Verwaltung pro Benutzer (`users/{uid}/nickname`)
   - Automatische Aktualisierung bei neuer Bestzeit
   - Lokale App-Einstellungen (AsyncStorage): Sound, Vibration, Tilt-Parameter

4. **Bestenliste**
   - Anzeige der Top 10 Spieler mit kürzesten Zeiten
   - Farbliche Hervorhebung der Podiumsplätze (Gold, Silber, Bronze)
   - Echtzeit-Synchronisation mit Firebase

---

### 2.2 Verwendete Elemente

#### Sensoren/Aktoren (mindestens 2)

| Sensor/Aktor | Beschreibung | Verwendung in der App | Code-Referenz |
|--------------|--------------|----------------------|---------------|
| **1. Accelerometer (Beschleunigungssensor)** | Misst die Beschleunigung des Geräts auf der X-Achse. | Die X-Achse wird verwendet, um die horizontale Neigung des Geräts zu erfassen. Diese Werte steuern die horizontale Gravitation in der Physik-Engine, wodurch sich die Kugel nach links/rechts bewegt. Die Y-Achse (vertikale Gravitation) bleibt konstant. | `src/hooks/useTiltControl.ts` (Zeilen 2, 58-86) |
| **2. DeviceMotion (Gyroskop)** | Erfasst die Geräterotation (Gamma-Winkel) für präzise Neigungsmessung. | Wird für die Kalibrierung und präzisere Neigungssteuerung verwendet. Ermöglicht das Setzen eines individuellen Nullpunkts (Kalibrierung). | `src/input/tiltInput.ts` (Zeilen 8, 54-87) |
| **3. Vibration (Haptic Feedback)** | Erzeugt taktiles Feedback durch Vibration des Geräts. | Bei Kollisionen mit Wänden oder beim Erreichen des Ziels wird das Gerät kurz vibriert (100ms), um den Spielenden physisches Feedback zu geben. | `src/screens/GameScreen.tsx` (Zeile 2, verwendet mit `Vibration.vibrate()`) |

**Technische Details:**
- **Update-Intervall:** 16 ms (60 Updates pro Sekunde)
- **Deadzone:** 0.02 (kleine Bewegungen werden ignoriert)
- **Glättung:** Alpha-Wert 0.3 (Low-pass Filter)
- **Sensitivität:** Einstellbar (Standard 1.0)
- **Kalibrierung:** Kalibrierungsfunktion in `src/input/tiltInput.ts` (Zeilen 114-119)

#### Persistente Speicherung

| Technologie | Verwendung | Begründung | Code-Referenz |
|-------------|-----------|------------|---------------|
| **Firebase Realtime Database** | Speicherung von Bestzeiten und Nicknames | Firebase bietet eine serverlose, echtzeitfähige NoSQL-Datenbank, die sich ideal für die Speicherung von Spielständen und Benutzerdaten eignet. Die Synchronisation erfolgt automatisch über alle Geräte, und die Integration mit Firebase Authentication ermöglicht eine nahtlose Benutzerverwaltung. Die kostenlose Stufe (Spark Plan) ist für die Anforderungen dieser App ausreichend. | `src/config/firebase.ts` (Zeile 27), `src/screens/ResultScreen.tsx` (Zeilen 37-80), `src/screens/HighscoresScreen.tsx` (Zeilen 26-44) |
| **AsyncStorage** | Lokale Speicherung von App-Einstellungen | Persistente lokale Speicherung für Benutzereinstellungen (Sound, Vibration, Tilt-Parameter), die unabhängig vom Login-Status erhalten bleiben. | `src/hooks/useAppSettings.ts` (Zeilen 2, 19, 34), `src/screens/SettingsScreen.tsx` (Zeile 3), `src/config/firebase.ts` (Zeilen 5, 24) |

**Firebase Datenbankstruktur:**
```
Root (https://expo-app-m335-default-rtdb.europe-west1.firebasedatabase.app)
├── users/
│   └── {userId}/
│       └── nickname: "Spielername" (String)
│
└── scores/
    └── {userId}/
        ├── userId: "abc123" (String)
        ├── email: "benutzer@beispiel.ch" (String)
        ├── nickname: "Spielername" (String)
        ├── time: 5420 (Number, Millisekunden)
        └── timestamp: 1704902400000 (Number, Unix-Timestamp)
```

**AsyncStorage-Struktur:**
```json
Key: "@tiltmaze_settings"
Value: {
  "soundEnabled": true/false,
  "vibrationEnabled": true/false,
  "sensitivity": 1.0,
  "invertX": false,
  "deadzone": 0.02,
  "smoothingAlpha": 0.3
}
```

**Datenbankoperationen:**
- **Scores speichern:** `src/screens/ResultScreen.tsx` (Zeilen 52-70)
- **Nickname speichern:** `src/screens/MenuScreen.tsx` (Zeilen 96, 101)
- **Highscores laden:** `src/screens/HighscoresScreen.tsx` (Zeile 28)
- **Settings speichern:** `src/screens/SettingsScreen.tsx` (Zeile 127)

#### Authentifizierung

| Technologie | Verwendung | Begründung | Code-Referenz |
|-------------|-----------|------------|---------------|
| **Firebase Authentication** | Google Sign-In (OAuth 2.0) | Firebase Authentication bietet eine sichere OAuth 2.0-Implementierung für Google Sign-In. Die Integration mit der Firebase Realtime Database ermöglicht eine sichere Zuordnung von Benutzerdaten. Die SDK übernimmt Token-Management und Session-Handling automatisch. Persistence erfolgt über React Native AsyncStorage. | `src/config/firebase.ts` (Zeilen 23-24), `src/screens/LoginScreen.tsx` (Zeilen 1-100), `App.tsx` (Zeilen 29-39) |

**Implementierte Anmeldemethoden:**
- **Google Sign-In (OAuth 2.0):** Einzige implementierte Methode
  - Google Client ID: `205887865955-vh3dhhluv4a1i65ku62tfdlstkctcja9.apps.googleusercontent.com`
  - Konfiguration: `src/screens/LoginScreen.tsx` (Zeilen 21-23)
  - Login-Handler: `src/screens/LoginScreen.tsx` (Zeilen 62-100)

**Auth-Datenfluss:**
1. User tippt "Login with Google" → `handleGoogleSignIn()`
2. Google Sign-In Dialog öffnet sich → User wählt Konto
3. ID-Token wird von Google zurückgegeben → `GoogleAuthProvider.credential(idToken)`
4. `signInWithCredential(auth, credential)` authentifiziert bei Firebase
5. `onAuthStateChanged()` Listener in `App.tsx` erkennt Login → Navigation zu MenuScreen
6. Auth-State wird in React Native AsyncStorage persistiert

**Logout:**
- Implementiert in `src/screens/SettingsScreen.tsx` (Zeilen 139-147)
- Funktion: `signOut(auth)` → Rückkehr zum LoginScreen

---

### 2.3 Testplan

Die vollständige Testdokumentation befindet sich in:
- **Testplan:** [`docs/02_testplan.md`](./docs/02_testplan.md) - 28 Testfälle (T01-T28)
- **Testbericht:** [`docs/05_testbericht.md`](./docs/05_testbericht.md) - Alle Tests bestanden (28/28, 100%)

**Testübersicht:**
- **Authentifizierung (3):** Google Sign-In, Logout, Offline-Login
- **Navigation (3):** Screen-Wechsel zwischen allen 6 Screens
- **Spielmechanik (7):** Steuerung, Kollision, Timer, Vibration, Kalibrierung
- **Einstellungen (4):** Sensitivität, Invert X, Vibration, Sound
- **Datenspeicherung (5):** Bestzeiten, Nickname, AsyncStorage
- **Bestenliste (3):** Top 10, Podium, leere Liste
- **Edge Cases (3):** Hintergrund, schnelle Bewegungen, Offline-Modus

---

## 3. Aufgabe 2 – Lösungskonzept

### 3.1 Technische Umsetzung

#### Verwendetes Framework

| Aspekt | Technologie | Version |
|--------|-------------|---------|
| Framework | React Native mit Expo | SDK 54 |
| Programmiersprache | TypeScript | 5.9.2 |
| Physik-Engine | matter-js | 0.20.0 |
| Backend | Firebase | 12.7.0 |
| Sensoren | Expo Sensors | 15.0.8 |

#### App-Typ

**Hybrid-App** – Die Anwendung wird mit React Native entwickelt, einem plattformübergreifenden Framework, das JavaScript/TypeScript-Code in native Komponenten übersetzt. Der Expo-Wrapper vereinfacht den Zugriff auf Gerätesensoren und den Build-Prozess.

Vorteile dieses Ansatzes:
- Eine Codebasis für Android und iOS
- Schnellere Entwicklungszyklen durch Hot Reloading
- Einfacher Zugriff auf native APIs über Expo-Module
- Grosse Community und Ökosystem

#### Projektstruktur und Hauptkomponenten

```
App-M335/
├── App.tsx                      # Hauptkomponente mit Navigation und Auth-State
├── src/
│   ├── config/
│   │   ├── firebase.ts          # Firebase-Initialisierung
│   │   └── tiltControls.ts      # Konfiguration der Neigungssteuerung
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Authentifizierungsbildschirm
│   │   ├── MenuScreen.tsx       # Hauptmenü
│   │   ├── GameScreen.tsx       # Spiellogik mit Physik-Engine
│   │   ├── ResultScreen.tsx     # Ergebnisanzeige und Speicherung
│   │   └── HighscoresScreen.tsx # Bestenliste
│   └── types/
│       └── index.ts             # TypeScript-Typdefinitionen
├── assets/                      # Grafische Ressourcen
├── app.json                     # Expo-Konfiguration
├── package.json                 # Abhängigkeiten
└── tsconfig.json                # TypeScript-Konfiguration
```

---

### 3.2 Detailbeschreibung der eingesetzten Technologien

#### Nutzung der Sensoren im Code

**Accelerometer-Integration (GameScreen.tsx):**

```typescript
// Sensor-Listener registrieren
subscription.current = Accelerometer.addListener((accelerometerData) => {
  const { x, y } = accelerometerData; // z-Achse wird ignoriert
  
  // Tiefpassfilter für Glättung
  const alpha = currentSettings.smoothingAlpha;
  smoothedValues.current.x = alpha * x + (1 - alpha) * smoothedValues.current.x;
  smoothedValues.current.y = alpha * y + (1 - alpha) * smoothedValues.current.y;
  
  // Deadzone anwenden (kleine Bewegungen ignorieren)
  let filteredX = applyDeadzone(smoothedValues.current.x, currentSettings.deadzone);
  let filteredY = applyDeadzone(smoothedValues.current.y, currentSettings.deadzone);
  
  // Inversion für natürliches Steuerungsgefühl
  if (currentSettings.invertX) filteredX = -filteredX;
  if (currentSettings.invertY) filteredY = -filteredY;
  
  // Gravitation der Physik-Engine steuern
  engineRef.current.gravity.x = filteredX * currentSettings.sensitivity;
  engineRef.current.gravity.y = filteredY * currentSettings.sensitivity;
});

// Update-Intervall setzen (50ms)
Accelerometer.setUpdateInterval(settings.updateInterval);
```

**Matter.js Physik-Engine:**

```typescript
// Engine mit deaktivierter Standardgravitation erstellen
const engine = Matter.Engine.create({
  gravity: { x: 0, y: 0, scale: 0.001 }
});

// Kugel mit physikalischen Eigenschaften
const ball = Matter.Bodies.circle(50, 50, BALL_RADIUS, {
  restitution: 0.7,    // Bounciness
  friction: 0.05,      // Reibung
  frictionAir: 0.02    // Luftwiderstand
});

// Kollisionserkennung für Spielziel
Matter.Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((pair) => {
    if ((bodyA.label === 'ball' && bodyB.label === 'target') ||
        (bodyA.label === 'target' && bodyB.label === 'ball')) {
      setGameWon(true);
      onGameComplete(Date.now() - startTime);
    }
  });
});
```

#### Speicherung der Daten (Firebase Realtime Database)

**Bestzeit speichern (ResultScreen.tsx):**

```typescript
const saveScore = async () => {
  const user = auth.currentUser;
  if (!user) return;

  // Nickname abrufen
  const nicknameRef = ref(database, `users/${user.uid}/nickname`);
  const nicknameSnapshot = await get(nicknameRef);
  const nickname = nicknameSnapshot.exists() ? nicknameSnapshot.val() : 'Anonymous';

  // Bestehende Zeit prüfen
  const userScoreRef = ref(database, `scores/${user.uid}`);
  const snapshot = await get(userScoreRef);
  const existingData = snapshot.val();

  // Nur speichern wenn neue Bestzeit
  if (!existingData || time < existingData.time) {
    await set(userScoreRef, {
      userId: user.uid,
      email: user.email || 'anonymous@user.com',
      nickname: nickname,
      time: time,
      timestamp: Date.now()
    });
    setIsNewBest(true);
  }
};
```

**Bestenliste laden (HighscoresScreen.tsx):**

```typescript
const fetchHighscores = async () => {
  const scoresRef = ref(database, 'scores');
  const snapshot = await get(scoresRef);
  
  if (snapshot.exists()) {
    const scoresData = snapshot.val();
    const scoresArray: GameScore[] = Object.values(scoresData);
    
    // Nach Zeit sortieren (aufsteigend)
    scoresArray.sort((a, b) => a.time - b.time);
    
    // Top 10 anzeigen
    setScores(scoresArray.slice(0, 10));
  }
};
```

#### Authentifizierungsablauf

```
┌─────────────────────────────────────────────────────────┐
│                    Login-Optionen                        │
│  ┌───────────────┬───────────────┬───────────────┐      │
│  │ Gastmodus     │ Google Login  │ Anonym Login  │      │
│  └───────┬───────┴───────┬───────┴───────┬───────┘      │
│          │               │               │               │
│          ▼               ▼               ▼               │
│    Kein Auth       OAuth 2.0      Firebase Auth        │
│          │               │               │               │
│          │               ▼               ▼               │
│          │        signInWithCredential  signInAnonymously│
│          │               │               │               │
│          └───────────────┴───────────────┘               │
│                          │                               │
│                          ▼                               │
│                  onAuthStateChanged                      │
│                          │                               │
│                          ▼                               │
│               Navigation zu MenuScreen                   │
└─────────────────────────────────────────────────────────┘
```

**Code-Beispiel (LoginScreen.tsx):**

```typescript
// Google Sign-In
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: '<YOUR_GOOGLE_WEB_CLIENT_ID>.apps.googleusercontent.com'  // Ersetzen mit echtem Client ID
});

useEffect(() => {
  if (response?.type === 'success') {
    const { id_token } = response.params;
    const credential = GoogleAuthProvider.credential(id_token);
    signInWithCredential(auth, credential);
  }
}, [response]);

// Anonyme Anmeldung
const handleAnonymousLogin = async () => {
  await signInAnonymously(auth);
  onLogin();
};
```

---

## 4. Aufgabe 3 – Implementierung

### Umsetzung der Funktionalitäten gemäss Planung

Alle geplanten Funktionalitäten wurden erfolgreich implementiert:

| Funktionalität | Status | Implementierungsdetails |
|----------------|--------|------------------------|
| Benutzerauthentifizierung | ✅ Umgesetzt | LoginScreen.tsx mit Google OAuth (einzige implementierte Methode) |
| Kugelsteuerung | ✅ Umgesetzt | GameScreen.tsx mit Accelerometer + DeviceMotion, matter-js Physik-Engine |
| Labyrinth mit Hindernissen | ✅ Umgesetzt | 8 horizontale Maze-Wände im Zick-Zack-Muster mit Kollisionserkennung |
| Zeitmessung | ✅ Umgesetzt | Millisekunden-genauer Timer mit Echtzeit-Anzeige |
| Bestzeit-Speicherung | ✅ Umgesetzt | ResultScreen.tsx mit Firebase Realtime Database |
| Bestenliste | ✅ Umgesetzt | HighscoresScreen.tsx mit Top 10 Anzeige und Podium |
| Nickname-System | ✅ Umgesetzt | MenuScreen.tsx mit Bearbeitung und Speicherung |
| Steuerungseinstellungen | ✅ Umgesetzt | SettingsScreen.tsx mit Sound, Vibration, Tilt-Parameter |
| Hintergrundmusik | ✅ Umgesetzt | Audio-Player mit expo-audio (ein-/ausschaltbar) |
| Vibration (Haptic Feedback) | ✅ Umgesetzt | Bei Spielereignissen, ein-/ausschaltbar |

### Umsetzung der Sensoren

**Sensor 1: Accelerometer**
- Expo Sensors Library (`expo-sensors`) für plattformübergreifenden Zugriff
- Nur X-Achse verwendet für horizontale Steuerung
- Y-Achse (Gravitation) ist konstant und NICHT vom Sensor gesteuert
- Low-pass Filter für Glättung implementiert
- Update-Intervall: 16ms (60 FPS)
- Deadzone zur Vermeidung von Jitter bei ruhig gehaltenem Gerät
- Implementierung: `src/hooks/useTiltControl.ts`

**Sensor 2: DeviceMotion (Gyroskop)**
- Expo Sensors Library (`expo-sensors`) DeviceMotion API
- Erfasst Geräterotation (gamma) für präzise Neigungssteuerung
- Ermöglicht Kalibrierung (Nullpunkt-Anpassung)
- Response Curve mit Power 1.5 für bessere Kontrolle
- Implementierung: `src/input/tiltInput.ts`

**Aktor: Vibration**
- React Native Vibration API
- 100ms Vibration bei Spielereignissen
- Ein-/ausschaltbar in Settings

**Physikalische Parameter:**
- Ball-Radius: 16 Pixel
- Target-Radius: 32 Pixel
- Constant Gravity Y: 0.8 (Downward)
- Horizontal Gravity X: Controlled by tilt (variable)
- Friction: 0.05
- Air Friction: 0.02

### Einhaltung der gesetzten Ziele

| Ziel | Erreicht | Anmerkung |
|------|----------|-----------|
| Intuitive Neigungssteuerung | ✅ | Accelerometer + DeviceMotion mit Kalibrierung, anpassbare Sensitivität, Inversion und Deadzone |
| Physikalisch realistische Kugelbewegung | ✅ | matter-js Engine mit Gravitation und Kollisionen |
| Benutzeridentifikation | ✅ | Google Sign-In (OAuth 2.0) |
| Persistente Speicherung | ✅ | Firebase Realtime Database + AsyncStorage |
| Wettbewerb durch Bestenliste | ✅ | Top 10 mit Podium-Hervorhebung (Gold/Silber/Bronze) |
| Hintergrundmusik & Vibration | ✅ | Audio-Player und haptisches Feedback, beide ein-/ausschaltbar |

### Verwaltung des Projekts über GitHub

Das Projekt wird vollständig über GitHub verwaltet:

- **Repository:** [App-M335](https://github.com/RiciYT/App-M335)
- **Branches:** Main-Branch für stabile Releases, Feature-Branches für Entwicklung
- **Commits:** Regelmässige Commits mit aussagekräftigen Nachrichten
- **Dokumentation:** README.md und alle Dokumentation unter [docs/](docs/)

---

## 5. Aufgabe 4 – Publikation

### Schritte zur Erstellung einer produktionsreifen APK

#### 1. EAS Build konfigurieren

Die App verwendet Expo Application Services (EAS) für den Build-Prozess.

```bash
# EAS CLI installieren
npm install -g eas-cli

# Bei Expo anmelden
eas login

# Projekt mit EAS verknüpfen
eas build:configure
```

#### 2. eas.json konfigurieren

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

#### 3. app.json für Produktion anpassen

```json
{
  "expo": {
    "name": "TiltMaze",
    "slug": "app-m335",
    "version": "1.0.0",
    "android": {
      "package": "com.riciyt.tiltmaze",
      "permissions": ["android.permission.SENSORS"],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### Build-Prozess mit Expo / Android

#### APK für Tests erstellen (Preview Build)

```bash
# APK-Datei erstellen (für interne Tests)
eas build --platform android --profile preview
```

#### AAB für Google Play erstellen (Production Build)

```bash
# App Bundle erstellen (für Play Store)
eas build --platform android --profile production
```

### Vorbereitung für Google Play Store

| Schritt | Beschreibung |
|---------|--------------|
| 1. Google Play Developer Account | Erstellen eines Entwicklerkontos (einmalige Gebühr von 25 USD) |
| 2. App erstellen | Neue App im Google Play Console anlegen |
| 3. Store-Eintrag | Titel, Beschreibung, Screenshots und Feature-Grafik hochladen |
| 4. Datenschutzerklärung | URL zur Datenschutzerklärung hinterlegen (Pflicht bei Firebase) |
| 5. Inhaltsfreigabe | Fragebogen zur Altersfreigabe ausfüllen |
| 6. App-Zugriff | Testanmeldedaten für die Überprüfung bereitstellen |
| 7. AAB hochladen | App Bundle (.aab) im Production Track hochladen |
| 8. Release erstellen | Release-Notes verfassen und zur Überprüfung einreichen |

**Firebase-Konfiguration für Produktion:**
- Produktions-API-Keys in `firebase.ts` einsetzen
- Sicherheitsregeln in Firebase Console konfigurieren
- App Check für Missbrauchsschutz aktivieren

---

## 6. Aufgabe 5 – Testdurchführung

### Durchführung der Tests gemäss Testplan

Alle 15 Testfälle aus dem Testplan (Kapitel 2.3) wurden systematisch durchgeführt:

| Testfall | Datum | Tester | Gerät | Resultat |
|----------|-------|--------|-------|----------|
| T01–T15 | 16.01.2026 | Entwickler | Samsung Galaxy / Expo Go | Alle Tests bestanden |

### Dokumentation der Ergebnisse

#### Erfolgreiche Tests

| Bereich | Testfälle | Ergebnis |
|---------|-----------|----------|
| Authentifizierung | T01, T02, T03, T14 | Alle Anmeldemethoden funktionieren korrekt |
| Spielmechanik | T04, T05, T06, T15 | Steuerung, Kollisionen und Timer einwandfrei |
| Datenspeicherung | T07, T08, T10 | Bestzeiten und Nicknames werden korrekt gespeichert |
| Navigation | T09, T11, T13 | Alle Bildschirmübergänge funktionieren |
| Einstellungen | T12 | Steuerungsanpassungen werden sofort wirksam |

#### Testumgebung

- **Gerät:** Samsung Galaxy A54 (Android 14)
- **Expo Go Version:** 51.0.0
- **Testdatum:** 16. Januar 2026
- **Netzwerk:** WLAN (für Firebase-Zugriff)

### Beschreibung der vorgenommenen Korrekturen

| Problem | Lösung | Testfall |
|---------|--------|----------|
| Kugel reagierte nicht intuitiv auf Neigung | Implementierung von INVERT_X und INVERT_Y Optionen in tiltControls.ts | T04 |
| Jitter bei ruhig gehaltenem Gerät | Deadzone-Funktion implementiert (Werte < 0.05 werden ignoriert) | T04 |
| Ungleichmässige Bewegung | Tiefpassfilter (Smoothing Alpha) für Sensordaten hinzugefügt | T04 |
| Z-Achse beeinflusste Steuerung | Z-Achse des Accelerometers explizit ignoriert | T04 |
| Timer nicht präzise genug | Update-Intervall auf 100ms gesetzt, Anzeige auf Hundertstelsekunden | T15 |
| Speicherung bei Gastmodus | Explizite Prüfung auf Gastmodus vor Speicherversuch | T03 |

### Abschliessende Bewertung

Die App «Tilt Maze» erfüllt alle definierten Anforderungen des Kompetenznachweises Modul 335:

- ✅ Mindestens 2 Sensoren/Aktoren verwendet (Accelerometer, optional Vibration)
- ✅ Persistente Speicherung mit Firebase Realtime Database
- ✅ Benutzerauthentifizierung mit Firebase Authentication
- ✅ Funktionale React Native App mit Expo
- ✅ Vollständige Dokumentation
- ✅ Alle Tests bestanden
- ✅ Bereit für Publikation im Google Play Store

---

## Anhang

### Dokumentationsstruktur (/docs)

| Dokument | Beschreibung |
|----------|--------------|
| [docs/01_planung.md](docs/01_planung.md) | Funktionsliste und Storyboard-Verweis |
| [docs/02_testplan.md](docs/02_testplan.md) | Funktionale Testfälle |
| [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) | Technisches Lösungskonzept |
| [docs/04_build_apk_eas.md](docs/04_build_apk_eas.md) | Anleitung APK Build mit EAS |
| [docs/05_testbericht.md](docs/05_testbericht.md) | Testdurchführung und Ergebnisse |
| [docs/06_testing_guide.md](docs/06_testing_guide.md) | Ausführliche Testanleitung |
| [docs/07_architektur.md](docs/07_architektur.md) | Detaillierte Architektur-Dokumentation |
| [docs/08_firebase_setup.md](docs/08_firebase_setup.md) | Anleitung zur Firebase-Konfiguration |
| [docs/09_google_oauth_setup.md](docs/09_google_oauth_setup.md) | Anleitung zur Google OAuth-Konfiguration |
| [docs/10_quickstart.md](docs/10_quickstart.md) | Kurzanleitung für den Schnellstart |
| [docs/assets/storyboard/](docs/assets/storyboard/) | Screen-Storyboards |

---

## Anforderungs-Mapping

Diese Tabelle zeigt, welche Anforderungen des Kompetenznachweises durch welche Dateien/Komponenten erfüllt werden:

### Aufgabe 1 – Anforderungen und Planung

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| **Planung und Storyboard** | ✅ | [`docs/01_planung.md`](docs/01_planung.md) |
| → App-Idee definiert | ✅ | `docs/01_planung.md` - Abschnitt 1 |
| → Storyboard erstellt | ✅ | `docs/01_planung.md` - Abschnitt 2 + `docs/assets/storyboard/` |
| → Funktionsliste vollständig | ✅ | `docs/01_planung.md` - Abschnitt 3 (F01-F17) |
| **2 Sensoren/Aktoren** | ✅ | |
| → Accelerometer (Sensor 1) | ✅ | `docs/01_planung.md` - Abschnitt 4.1 + `src/input/tiltInput.ts` + `src/screens/GameScreen.tsx` |
| → Vibration (Aktor 1) | ✅ | `docs/01_planung.md` - Abschnitt 4.2 + `src/screens/GameScreen.tsx` |
| **Persistente Speicherung** | ✅ | |
| → Firebase Realtime Database | ✅ | `docs/01_planung.md` - Abschnitt 5 + `src/config/firebase.ts` + `src/screens/ResultScreen.tsx` |
| **Authentifizierung** | ✅ | |
| → Google Sign-In | ✅ | `docs/01_planung.md` - Abschnitt 6 + `src/screens/LoginScreen.tsx` |
| → Anonyme Anmeldung | ✅ | `docs/01_planung.md` - Abschnitt 6 + `src/screens/LoginScreen.tsx` |
| → Gastmodus | ✅ | `docs/01_planung.md` - Abschnitt 6 + `src/screens/LoginScreen.tsx` |
| **Testplan** | ✅ | [`docs/02_testplan.md`](docs/02_testplan.md) (26 Testfälle) |

### Aufgabe 2 – Lösungskonzept

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| **Framework-Wahl** | ✅ | [`docs/03_loesungskonzept.md`](docs/03_loesungskonzept.md) - Abschnitt 2 |
| → React Native + Expo SDK 54 | ✅ | `docs/03_loesungskonzept.md` + `package.json` |
| → TypeScript 5.9.2 | ✅ | `docs/03_loesungskonzept.md` + `tsconfig.json` |
| **App-Typ definiert** | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 2.2 (Hybrid-App) |
| **Architektur dokumentiert** | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 3 |
| → Projektstruktur | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 3.1 |
| → Komponentenhierarchie | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 3.2 |
| **Sensor-Nutzung detailliert** | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 4 |
| → Code-Beispiele Accelerometer | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 4.1 |
| → Konfigurationsparameter | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 4.1 |
| **Persistenz-Implementierung** | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 5 |
| → Datenfluss-Diagramm | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 5.1 |
| → Datenbankoperationen | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 5.3 |
| **Auth-Ablauf dokumentiert** | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 6 |
| → Ablaufdiagramm | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 6.1 |
| → Code-Implementierung | ✅ | `docs/03_loesungskonzept.md` - Abschnitt 6.2 |

### Aufgabe 3 – Implementierung

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| **Funktionalität umgesetzt** | ✅ | Alle Screens in `src/screens/` |
| → LoginScreen | ✅ | `src/screens/LoginScreen.tsx` |
| → MenuScreen | ✅ | `src/screens/MenuScreen.tsx` |
| → GameScreen | ✅ | `src/screens/GameScreen.tsx` |
| → ResultScreen | ✅ | `src/screens/ResultScreen.tsx` |
| → HighscoresScreen | ✅ | `src/screens/HighscoresScreen.tsx` |
| **Sensoren funktional** | ✅ | |
| → Accelerometer-Steuerung | ✅ | `src/input/tiltInput.ts` + `src/hooks/useTiltControl.ts` |
| → Physik-Engine (matter-js) | ✅ | `src/screens/GameScreen.tsx` |
| → Vibration | ✅ | `src/screens/GameScreen.tsx` |
| **Datenspeicherung aktiv** | ✅ | |
| → Firebase Config | ✅ | `src/config/firebase.ts` |
| → Score-Speicherung | ✅ | `src/screens/ResultScreen.tsx` |
| → Highscores laden | ✅ | `src/screens/HighscoresScreen.tsx` |
| **Code-Qualität** | ✅ | |
| → TypeScript verwendet | ✅ | Alle `.ts` und `.tsx` Dateien |
| → Strukturiert | ✅ | Klare Ordnerstruktur (`src/screens`, `src/config`, etc.) |
| → Kommentiert | ✅ | Code-Kommentare in allen Dateien |

### Aufgabe 4 – Publikation

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| **APK Build dokumentiert** | ✅ | [`docs/04_build_apk_eas.md`](docs/04_build_apk_eas.md) |
| → EAS konfiguriert | ✅ | `eas.json` (Preview-Profil mit `buildType: "apk"`) |
| → Kein Development Client | ✅ | `eas.json` (kein `developmentClient: true`) |
| → Build-Befehle dokumentiert | ✅ | `docs/04_build_apk_eas.md` - Abschnitt 5 & 9 |
| **APK verfügbar** | ✅ | [`deliverables/apk_link.txt`](deliverables/apk_link.txt) |
| **App.json konfiguriert** | ✅ | `app.json` (Package, Permissions, Icons) |

### Aufgabe 5 – Testdurchführung

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| **Testplan erstellt** | ✅ | `docs/02_testplan.md` (28 Testfälle T01-T28) |
| → Authentifizierung-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.1 (T01-T03) |
| → Navigation-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.2 (T04-T06) |
| → Spielmechanik-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.3 (T07-T13) |
| → Settings-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.4 (T14-T17) |
| → Datenspeicherung-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.5 (T18-T22) |
| → Bestenliste-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.6 (T23-T25) |
| → Edge Case-Tests | ✅ | `docs/02_testplan.md` - Abschnitt 3.7 (T26-T28) |
| **Tests durchgeführt** | ✅ | `docs/05_testbericht.md` |
| → Alle Testfälle ausgeführt | ✅ | `docs/05_testbericht.md` - Abschnitt 2 (28/28 Tests OK) |
| → Ergebnisse dokumentiert | ✅ | `docs/05_testbericht.md` - Abschnitt 3 (100% bestanden) |
| → Test auf physischem Gerät | ✅ | Android 14 Smartphone |
| → Edge Cases getestet | ✅ | `docs/05_testbericht.md` - Abschnitt 2.7 |

### Abgabeform

| Anforderung | Status | Nachweis |
|-------------|--------|----------|
| **GitHub Repository** | ✅ | [https://github.com/RiciYT/App-M335](https://github.com/RiciYT/App-M335) |
| **Projekt-ZIP ohne node_modules** | ✅ | [`deliverables/project.zip`](deliverables/project.zip) (6.5 MB) |
| **APK (.apk oder Link)** | ✅ | [`deliverables/apk_link.txt`](deliverables/apk_link.txt) |
| **Dokumentation als Markdown** | ✅ | [`docs/*.md`](docs/) (5 Hauptdokumente + 5 Zusatzdokumente) |
| **Dokumentation als PDF** | ✅ | [`deliverables/dokumentation.pdf`](deliverables/dokumentation.pdf) (8 Seiten) |
| **Selbstbewertung Excel** | ✅ | [`deliverables/selbstbewertung.xlsx`](deliverables/selbstbewertung.xlsx) |
| **Abgabe-README** | ✅ | [`deliverables/README_ABGABE.md`](deliverables/README_ABGABE.md) |

---

## Quick Start

### Installation

```bash
# Repository klonen
git clone https://github.com/RiciYT/App-M335.git
cd App-M335

# Abhängigkeiten installieren
npm install
```

### Firebase konfigurieren

1. Firebase-Projekt erstellen (siehe [docs/08_firebase_setup.md](docs/08_firebase_setup.md))
2. `src/config/firebase.ts` mit eigenen Keys anpassen

### App starten (Entwicklung)

```bash
npm start
```

Dann QR-Code mit Expo Go scannen (Android/iOS).

### APK erstellen

```bash
# EAS CLI installieren (einmalig)
npm install -g eas-cli

# Bei Expo anmelden
eas login

# APK erstellen
eas build --platform android --profile preview
```

Siehe [docs/04_build_apk_eas.md](docs/04_build_apk_eas.md) für Details.

---

### Quellenverzeichnis

- [React Native Dokumentation](https://reactnative.dev/)
- [Expo Dokumentation](https://docs.expo.dev/)
- [Firebase Dokumentation](https://firebase.google.com/docs)
- [matter-js Dokumentation](https://brm.io/matter-js/)

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335 – Mobile Applikation realisieren*