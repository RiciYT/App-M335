# TiltMaze – Modul 335 Kompetenznachweis

## Kurzbeschreibung

**TiltMaze** ist ein Geschicklichkeitsspiel für Android, bei dem eine Kugel durch Neigen des Smartphones durch ein Labyrinth gesteuert wird. Die App nutzt Gerätesensoren (DeviceMotion + Accelerometer) für die Steuerung und speichert Bestzeiten in Firebase. Authentifizierung erfolgt via Google Sign-In.

---

## Inhaltsverzeichnis

1. [Setup & Start](#setup--start)
2. [Konfiguration](#konfiguration)
3. [Features](#features)
4. [Sensoren & Aktoren](#sensoren--aktoren)
5. [Persistente Speicherung](#persistente-speicherung)
6. [Authentifizierung](#authentifizierung)
7. [APK Build (EAS)](#apk-build-eas)
8. [Dokumentation](#dokumentation)
9. [Anforderungs-Mapping](#anforderungs-mapping)

---

## Setup & Start

### Voraussetzungen

- **Node.js** ≥ 18
- **npm** oder **yarn**
- **Expo CLI** (optional, via npx nutzbar)
- **EAS CLI** für Builds: `npm install -g eas-cli`
- **Expo Go App** auf Android-Gerät (für Entwicklung)

### Installation

```bash
# Repository klonen
git clone https://github.com/RiciYT/App-M335.git
cd App-M335

# Abhängigkeiten installieren
npm install
```

### Entwicklung starten

```bash
npm start
```

Dann den QR-Code mit Expo Go scannen.

---

## Konfiguration

### Umgebungsvariablen

Die App verwendet Umgebungsvariablen für sensible Konfigurationsdaten. Erstelle eine `.env` Datei basierend auf `.env.example`:

```bash
# .env Datei erstellen
cp .env.example .env
```

Fülle die folgenden Werte in deiner `.env` Datei aus:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project_id.firebasedatabase.app
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Sign-In Configuration
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
```

### Firebase & Google Services

Kopiere die Beispiel-Konfigurationsdateien und fülle sie mit deinen eigenen Werten:

```bash
cp credentials.example.json credentials.json
cp google-services.example.json google-services.json
```

- **credentials.json:** Android Keystore-Konfiguration für EAS Builds
- **google-services.json:** Firebase Android-Konfiguration (aus Firebase Console)

---

## Features

- 🎮 **Neigungssteuerung** – Kugel durch Kippen des Geräts steuern
- 🧱 **Labyrinth** – Zick-Zack-Wände als Hindernisse
- ⏱️ **Timer** – Zeitmessung mit Millisekunden-Genauigkeit
- 📊 **Bestenliste** – Top 10 global (Firebase)
- 👤 **Google Login** – OAuth 2.0 Authentifizierung
- 🔊 **Hintergrundmusik** – Ein-/ausschaltbar
- 📳 **Vibration** – Haptisches Feedback bei Ereignissen
- ⚙️ **Einstellungen** – Sensitivität, Sound, Vibration
- 🎯 **Kalibrierung** – Nullpunkt für Neigungssteuerung anpassbar

### Screens/Navigation (User-Flow)

```
LoginScreen → MenuScreen → GameScreen → ResultScreen
                  ↓              ↑
            HighscoresScreen ←───┘
                  ↓
            SettingsScreen
```

| Screen | Datei | Funktion |
|--------|-------|----------|
| LoginScreen | `src/screens/LoginScreen.tsx` | Google Sign-In |
| MenuScreen | `src/screens/MenuScreen.tsx` | Hauptmenü, Nickname, Navigation |
| GameScreen | `src/screens/GameScreen.tsx` | Spiellogik, Physik, Timer |
| ResultScreen | `src/screens/ResultScreen.tsx` | Ergebnis, Bestzeit-Speicherung |
| HighscoresScreen | `src/screens/HighscoresScreen.tsx` | Top 10 Bestenliste |
| SettingsScreen | `src/screens/SettingsScreen.tsx` | Einstellungen, Logout |

---

## Sensoren & Aktoren

### Sensor 1: DeviceMotion (Gyroskop/Rotation)

| Eigenschaft | Wert |
|-------------|------|
| **Bibliothek** | `expo-sensors` (DeviceMotion API) |
| **Verwendung** | Erfassung der Geräterotation (gamma) für Neigungssteuerung |
| **Code-Datei** | `src/input/tiltInput.ts` |
| **Relevante Zeilen** | Zeilen 8, 54-87, 114-119 (Kalibrierung) |

```typescript
// src/input/tiltInput.ts (Auszug)
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
// gamma = links-rechts Neigung in Radiant
let tiltValue = rotation.gamma / maxTiltAngle;
```

### Sensor 2: Accelerometer (Beschleunigungssensor)

| Eigenschaft | Wert |
|-------------|------|
| **Bibliothek** | `expo-sensors` (Accelerometer API) |
| **Verwendung** | X-Achsen-Beschleunigung für horizontale Kugelsteuerung |
| **Code-Datei** | `src/hooks/useTiltControl.ts` |
| **Relevante Zeilen** | Zeilen 2, 58-89 |

```typescript
// src/hooks/useTiltControl.ts (Auszug)
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
// Nur X-Achse für horizontale Gravitation
engine.gravity.x = filteredX * currentSettings.sensitivity;
```

### Aktor 1: Vibration (Haptic Feedback)

| Eigenschaft | Wert |
|-------------|------|
| **Bibliothek** | `react-native` (Vibration API) |
| **Verwendung** | Haptisches Feedback bei Kollisionen, Spielende |
| **Code-Datei** | `src/screens/GameScreen.tsx` |
| **Relevante Zeilen** | Zeile 2 (Import), Zeilen 246, 273, 572 |

```typescript
// src/screens/GameScreen.tsx (Auszug)
import { Vibration } from 'react-native';
if (vibrationEnabledRef.current) {
  Vibration.vibrate(100); // 100ms
}
```

---

## Persistente Speicherung

### 1. Firebase Realtime Database (Cloud)

| Eigenschaft | Wert |
|-------------|------|
| **Technologie** | Firebase Realtime Database |
| **Projekt** | `expo-app-m335` |
| **URL** | `https://expo-app-m335-default-rtdb.europe-west1.firebasedatabase.app` |
| **Gespeicherte Daten** | Bestzeiten (`scores/{userId}`), Nicknames (`users/{userId}/nickname`) |
| **Code-Dateien** | `src/config/firebase.ts` (Zeile 27), `src/screens/ResultScreen.tsx` (Zeilen 37-80), `src/screens/HighscoresScreen.tsx` (Zeilen 26-44) |

**Datenbankstruktur:**
```
scores/{userId}/
  ├── userId: string
  ├── email: string
  ├── nickname: string
  ├── time: number (ms)
  └── timestamp: number

users/{userId}/
  └── nickname: string
```

### 2. AsyncStorage (Lokal)

| Eigenschaft | Wert |
|-------------|------|
| **Technologie** | `@react-native-async-storage/async-storage` |
| **Verwendung** | App-Einstellungen (Sound, Vibration, Tilt-Parameter) |
| **Key** | `@tiltmaze_settings` |
| **Code-Dateien** | `src/hooks/useAppSettings.ts` (Zeilen 2, 19, 34), `src/screens/SettingsScreen.tsx` (Zeilen 3, 127, 145-148), `src/types/index.ts` (Zeile 23) |

**Gespeicherte Einstellungen:**
```json
{
  "soundEnabled": boolean,
  "vibrationEnabled": boolean,
  "sensitivity": number,
  "invertX": boolean,
  "deadzone": number,
  "smoothingAlpha": number
}
```

---

## Authentifizierung

| Eigenschaft | Wert |
|-------------|------|
| **Technologie** | Firebase Authentication |
| **Methode** | Google Sign-In (OAuth 2.0) – **einzige implementierte Methode** |
| **Bibliothek** | `@react-native-google-signin/google-signin` |
| **Code-Dateien** | `src/screens/LoginScreen.tsx` (Zeilen 1-100), `src/config/firebase.ts` (Zeilen 23-25), `App.tsx` (Zeilen 29-39) |

**Auth-Flow:**
1. User tippt "Login with Google" → `handleGoogleSignIn()` (LoginScreen.tsx:62-100)
2. Google OAuth Dialog → User wählt Konto
3. ID-Token → `GoogleAuthProvider.credential(idToken)` → `signInWithCredential(auth, credential)`
4. `onAuthStateChanged()` in App.tsx erkennt Login → Navigation zu MenuScreen
5. Auth-State persistiert via React Native AsyncStorage (`getReactNativePersistence`)

**Logout:**
- `src/screens/SettingsScreen.tsx` (Zeilen 192-211)
- Funktion: `signOut(auth)` → Rückkehr zum LoginScreen

---

## APK Build (EAS)

### Build-Profil

Die Datei `eas.json` definiert das Build-Profil:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Wichtige app.config.js Werte

```javascript
// app.config.js
export default {
  expo: {
    name: "TiltMaze",
    slug: "app-m335",
    version: "1.0.0",
    android: {
      package: "com.riciyt.tiltmaze",
      permissions: ["android.permission.SENSORS"],
      googleServicesFile: "./google-services.json"
    },
    extra: {
      eas: {
        projectId: "ea02cbdc-02ce-4529-a804-2cfd1dcc00c9"
      },
      // Loaded from .env file
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      // ...
    }
  }
};
```

### Build-Befehle (APK ohne Dev Client)

```bash
# 1. EAS CLI installieren (einmalig)
npm install -g eas-cli

# 2. Bei Expo anmelden
eas login

# 3. APK erstellen (Preview-Profil)
eas build --platform android --profile preview
```

### Build-Output

Nach erfolgreichem Build erscheint ein Download-Link in der Konsole:

```
✔ Build finished.
🤖 Android build: https://expo.dev/artifacts/eas/xxxxx.apk
```

Alternativ: Build-Liste unter [expo.dev](https://expo.dev) im Dashboard oder via `eas build:list`.

---

## Dokumentation

Alle Detail-Dokumentationen befinden sich im `/docs`-Ordner:

| Dokument | Inhalt |
|----------|--------|
| [docs/01_planung.md](docs/01_planung.md) | App-Idee, Storyboard, Funktionsliste, Sensoren, Speicherung, Auth |
| [docs/02_testplan.md](docs/02_testplan.md) | 28 Testfälle (T01-T28), Testumgebung |
| [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) | Framework, Architektur, Sensor-/Auth-/Storage-Details, Physik-Engine |
| [docs/04_build_apk_eas.md](docs/04_build_apk_eas.md) | EAS Build-Anleitung, Konfiguration, Befehle |
| [docs/05_testbericht.md](docs/05_testbericht.md) | Testergebnisse (28/28 bestanden), Fehler, Fazit |

**Weitere Dokumentation:**
- [docs/06_testing_guide.md](docs/06_testing_guide.md) – Ausführliche Testanleitung
- [docs/07_architektur.md](docs/07_architektur.md) – Detaillierte Architektur
- [docs/08_firebase_setup.md](docs/08_firebase_setup.md) – Firebase-Konfiguration
- [docs/09_google_oauth_setup.md](docs/09_google_oauth_setup.md) – Google OAuth Setup
- [docs/10_quickstart.md](docs/10_quickstart.md) – Kurzanleitung

---

## Anforderungs-Mapping

Diese Tabelle zeigt die Zuordnung der PDF-Anforderungen (`08.1_Kompetenznachweis_335_func-2025.pdf`) zu den Nachweisen:

### Aufgabe 1 – Anforderungen und Planung

| Anforderung (PDF) | Abgabeform | Nachweis (README-Abschnitt / docs / Code) |
|-------------------|------------|-------------------------------------------|
| **a) Planung mit Storyboard** | Dokumentation | [docs/01_planung.md](docs/01_planung.md) Abschnitt 2, [docs/assets/storyboard/](docs/assets/storyboard/) |
| **a) Funktionsliste** | Dokumentation | [docs/01_planung.md](docs/01_planung.md) Abschnitt 3 (F01-F19), [README: Features](#features) |
| **b) 2 Sensoren/Aktoren** | Code + Doku | [README: Sensoren & Aktoren](#sensoren--aktoren), [docs/01_planung.md](docs/01_planung.md) Abschnitt 4, Code: `src/input/tiltInput.ts`, `src/hooks/useTiltControl.ts`, `src/screens/GameScreen.tsx` |
| **b) 1 persistente Storage** | Code + Doku | [README: Persistente Speicherung](#persistente-speicherung), [docs/01_planung.md](docs/01_planung.md) Abschnitt 5, Code: `src/config/firebase.ts`, `src/screens/ResultScreen.tsx` |
| **b) 1 Authentifizierung** | Code + Doku | [README: Authentifizierung](#authentifizierung), [docs/01_planung.md](docs/01_planung.md) Abschnitt 6, Code: `src/screens/LoginScreen.tsx` |
| **c) Testplan** | Dokumentation | [docs/02_testplan.md](docs/02_testplan.md) (28 Testfälle T01-T28) |

### Aufgabe 2 – Lösungskonzept

| Anforderung (PDF) | Abgabeform | Nachweis |
|-------------------|------------|----------|
| **a) Framework & App-Typ** | Dokumentation | [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) Abschnitt 2 (React Native, Expo SDK 54, Hybrid-App) |
| **a) Architektur/Komponenten** | Dokumentation | [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) Abschnitt 3, [README: Features/Screens](#features) |
| **b) Sensor-Nutzung Detail** | Dokumentation | [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) Abschnitt 4, [README: Sensoren & Aktoren](#sensoren--aktoren) |
| **b) Persistenz-Detail** | Dokumentation | [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) Abschnitt 5, [README: Persistente Speicherung](#persistente-speicherung) |
| **b) Auth-Detail** | Dokumentation | [docs/03_loesungskonzept.md](docs/03_loesungskonzept.md) Abschnitt 6, [README: Authentifizierung](#authentifizierung) |

### Aufgabe 3 – Implementierung

| Anforderung (PDF) | Abgabeform | Nachweis |
|-------------------|------------|----------|
| **a) Funktionalität umgesetzt** | GitHub / .zip | Alle Screens in `src/screens/`, Navigation in `App.tsx` |
| **b) Sensoren umgesetzt** | Code | `src/input/tiltInput.ts` (DeviceMotion), `src/hooks/useTiltControl.ts` (Accelerometer), `src/screens/GameScreen.tsx` (Vibration) |
| **GitHub-Verwaltung** | Repository | [github.com/RiciYT/App-M335](https://github.com/RiciYT/App-M335) |

### Aufgabe 4 – Publikation

| Anforderung (PDF) | Abgabeform | Nachweis |
|-------------------|------------|----------|
| **a) Build-Schritte dokumentiert** | Dokumentation | [README: APK Build (EAS)](#apk-build-eas), [docs/04_build_apk_eas.md](docs/04_build_apk_eas.md) |
| **b) .apk Datei erstellt** | APK-Datei/Link | EAS Build: `eas build --platform android --profile preview`, Output unter expo.dev |
| **EAS-Konfiguration** | Code | `eas.json` (Profile: `preview`, buildType: `apk`), `app.json` |

### Aufgabe 5 – Testdurchführung

| Anforderung (PDF) | Abgabeform | Nachweis |
|-------------------|------------|----------|
| **a) Tests gemäss Testplan** | Dokumentation | [docs/05_testbericht.md](docs/05_testbericht.md) Abschnitt 2 |
| **a) Ergebnisse dokumentiert** | Dokumentation | [docs/05_testbericht.md](docs/05_testbericht.md) Abschnitt 3 (28/28 Tests bestanden, 100%) |
| **Korrekturen vorgenommen** | Dokumentation | [docs/05_testbericht.md](docs/05_testbericht.md) Abschnitt 4 (behobene Fehler B01-B05) |


## Technologie-Stack

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| React Native | 0.81.5 | Framework |
| Expo | SDK 54 | Build & APIs |
| TypeScript | 5.9.2 | Programmiersprache |
| Firebase | 12.7.0 | Auth & Database |
| matter-js | 0.20.0 | Physik-Engine |
| expo-sensors | 15.0.8 | Sensor-APIs |
| expo-audio | 1.1.1 | Hintergrundmusik |

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335 – Mobile Applikation realisieren*
