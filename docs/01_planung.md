# Planung – Tilt Maze

## 1. App-Idee

**Tilt Maze** ist ein Geschicklichkeitsspiel für mobile Geräte, bei dem die Spielenden eine Kugel durch Neigen des Smartphones durch ein Labyrinth navigieren. Ziel ist es, die Kugel möglichst schnell ins Zielfeld zu manövrieren.

## 2. Screen-Storyboard

Die Storyboard-Skizzen befinden sich im Ordner [assets/storyboard/](./assets/storyboard/).

### Übersicht der Screens

```
┌─────────────────────────────────────────────────────────────┐
│                     SCREEN-ABLAUF                            │
│                                                              │
│   ┌──────────────┐                                           │
│   │ LoginScreen  │─────────────────────────┐                 │
│   │              │                         │                 │
│   │ • Google     │                         │                 │
│   │   Sign-In    │                         │                 │
│   └──────┬───────┘                         │                 │
│          │                                 │                 │
│          ▼                                 │                 │
│   ┌──────────────┐    ┌───────────────┐    │                 │
│   │  MenuScreen  │───►│  GameScreen   │    │                 │
│   │              │    │               │    │                 │
│   │ • Nickname   │    │ • Labyrinth   │    │                 │
│   │ • Play Game  │    │ • Neigung     │    │                 │
│   │ • Highscores │    │ • Timer       │    │                 │
│   │ • Logout     │    └───────┬───────┘    │                 │
│   └──────┬───────┘            │            │                 │
│          │                    ▼            │                 │
│          │            ┌───────────────┐    │                 │
│          │            │ ResultScreen  │────┘                 │
│          │            │               │                      │
│          │            │ • Zeit        │                      │
│          │            │ • Speichern   │                      │
│          │            │ • Nochmal     │                      │
│          │            └───────────────┘                      │
│          │                                                   │
│          ▼                                                   │
│   ┌──────────────────┐                                       │
│   │ HighscoresScreen │                                       │
│   │                  │                                       │
│   │ • Top 10         │                                       │
│   │ • Rangliste      │                                       │
│   └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## 3. Funktionsliste

### 3.1 Benutzerauthentifizierung

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F01 | Google Sign-In | Anmeldung mit Google-Konto über OAuth 2.0 |
| F02 | Logout | Abmeldung und Rückkehr zum Login-Screen |
| F03 | Nickname | Benutzer können einen Spielernamen festlegen |

### 3.2 Spielfunktionen

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F04 | Kugelsteuerung | Kugel wird durch Neigen des Geräts (Accelerometer + DeviceMotion) gesteuert |
| F05 | Physik-Engine | Realistische Kugelbewegung mit matter-js (Reibung, Kollision) |
| F06 | Labyrinth | Spielfeld mit Hindernissen (Wände im Zick-Zack-Muster) |
| F07 | Kollisionserkennung | Erkennung von Kontakt mit Wänden und Zielfeld |
| F08 | Timer | Zeitmessung mit Millisekunden-Genauigkeit |
| F09 | Vibration | Haptisches Feedback bei Spielereignissen (einstellbar) |
| F10 | Steuerungseinstellungen | Anpassbare Sensitivität, Deadzone, Glättung, Kalibrierung |
| F11 | Ziel erreichen | Spiel endet bei Kontakt der Kugel mit dem Zielfeld |
| F12 | Hintergrundmusik | Audio-Player für Musik (einstellbar) |

### 3.3 Datenspeicherung

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F13 | Bestzeit speichern | Speicherung der Bestzeit in Firebase Realtime Database |
| F14 | Nickname speichern | Nickname wird pro Benutzer gespeichert |
| F15 | Bestenliste laden | Abruf der Top 10 Spielzeiten aus der Datenbank |
| F16 | App-Einstellungen | Lokale Speicherung mit AsyncStorage (Sound, Vibration, Tilt-Parameter) |

### 3.4 Bestenliste

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F17 | Top 10 Anzeige | Sortierte Liste der besten 10 Zeiten |
| F18 | Podium-Hervorhebung | Gold, Silber, Bronze für die Top 3 |
| F19 | Zeitformatierung | Anzeige im Format X.XXs |

## 4. Verwendete Sensoren und Aktoren

### 4.1 Sensor 1: Accelerometer (Beschleunigungssensor)

- **Bibliothek:** `expo-sensors` (Accelerometer API)
- **Verwendung:** Erfassung der X-Achsen-Beschleunigung für horizontale Kugelsteuerung
- **Implementierung:** `src/hooks/useTiltControl.ts`
- **Parameter:**
  - Update-Intervall: 16ms (60 Updates/Sekunde)
  - Deadzone: 0.02
  - Glättung (Alpha): 0.3
  - Sensitivität: einstellbar (Standard 1.0)

### 4.2 Sensor 2: DeviceMotion (Gyroskop/Rotation)

- **Bibliothek:** `expo-sensors` (DeviceMotion API)
- **Verwendung:** Erfassung der Geräterotation (gamma) für präzise Neigungssteuerung und Kalibrierung
- **Implementierung:** `src/input/tiltInput.ts`
- **Parameter:**
  - Update-Intervall: 16ms
  - Kalibrierbar: Ja (Nullpunkt-Anpassung)
  - Response Curve: Power 1.5 für bessere Kontrolle

### 4.3 Aktor 1: Vibration (Haptisches Feedback)

- **Bibliothek:** `react-native` (Vibration API)
- **Verwendung:** Feedback bei Kollisionen oder Spielereignissen
- **Implementierung:** `src/screens/GameScreen.tsx`
- **Steuerung:** Ein-/Ausschaltbar in Settings

## 5. Persistente Speicherung

### 5.1 Firebase Realtime Database

- **Technologie:** Firebase Realtime Database (Cloud NoSQL)
- **Projekt:** expo-app-m335
- **Datenmodell:** Siehe [03_loesungskonzept.md](./03_loesungskonzept.md)
- **Datenbankstruktur:**
  - `scores/{userId}`: Bestzeiten der Benutzer
  - `users/{userId}/nickname`: Spielernamen
- **Operationen:**
  - Schreiben: Bestzeiten, Nicknames
  - Lesen: Highscores (Top 10), eigene Bestzeit

### 5.2 AsyncStorage (Lokal)

- **Technologie:** @react-native-async-storage/async-storage
- **Verwendung:** App-Einstellungen (Sound, Vibration, Tilt-Parameter)
- **Key:** `@tiltmaze_settings`
- **Datenstruktur:** JSON-Objekt mit soundEnabled, vibrationEnabled, sensitivity, invertX, deadzone, smoothingAlpha
- **Implementierung:** `src/hooks/useAppSettings.ts`, `src/screens/SettingsScreen.tsx`

## 6. Authentifizierung

- **Technologie:** Firebase Authentication
- **Methoden:**
  - Google Sign-In (OAuth 2.0) - einzige implementierte Methode
- **Konfiguration:** `src/config/firebase.ts`
- **Google Client ID:** Konfiguriert in `src/screens/LoginScreen.tsx`
- **Persistence:** React Native AsyncStorage über `getReactNativePersistence()`

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335*
