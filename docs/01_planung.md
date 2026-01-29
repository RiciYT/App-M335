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
| F02 | Anonyme Anmeldung | Anmeldung ohne Google-Konto (Firebase Anonymous Auth) |
| F03 | Gastmodus | Spielen ohne Anmeldung, keine Speicherung von Zeiten |
| F04 | Logout | Abmeldung und Rückkehr zum Login-Screen |
| F05 | Nickname | Benutzer können einen Spielernamen festlegen |

### 3.2 Spielfunktionen

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F04 | Kugelsteuerung | Kugel wird durch Neigen des Geräts (Accelerometer) gesteuert |
| F05 | Physik-Engine | Realistische Kugelbewegung mit matter-js (Reibung, Kollision) |
| F06 | Labyrinth | Spielfeld mit Hindernissen (Wände im Zick-Zack-Muster) |
| F07 | Kollisionserkennung | Erkennung von Kontakt mit Wänden und Zielfeld |
| F08 | Timer | Zeitmessung mit Millisekunden-Genauigkeit |
| F09 | Vibration | Haptisches Feedback bei Spielereignissen |
| F10 | Steuerungseinstellungen | Anpassbare Sensitivität, Deadzone, Glättung |
| F11 | Ziel erreichen | Spiel endet bei Kontakt der Kugel mit dem Zielfeld |

### 3.3 Datenspeicherung

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F12 | Bestzeit speichern | Speicherung der Bestzeit in Firebase Realtime Database |
| F13 | Nickname speichern | Nickname wird pro Benutzer gespeichert |
| F14 | Bestenliste laden | Abruf der Top 10 Spielzeiten aus der Datenbank |

### 3.4 Bestenliste

| ID | Funktion | Beschreibung |
|----|----------|--------------|
| F15 | Top 10 Anzeige | Sortierte Liste der besten 10 Zeiten |
| F16 | Podium-Hervorhebung | Gold, Silber, Bronze für die Top 3 |
| F17 | Zeitformatierung | Anzeige im Format X.XXs |

## 4. Verwendete Sensoren und Aktoren

### 4.1 Sensor 1: Accelerometer (Beschleunigungssensor)

- **Bibliothek:** `expo-sensors`
- **Verwendung:** Erfassung der Geräteneigung auf X- und Y-Achse
- **Implementierung:** `src/input/tiltInput.ts` und `src/screens/GameScreen.tsx`
- **Parameter:**
  - Update-Intervall: 50ms
  - Deadzone: 0.05
  - Glättung (Alpha): 0.3
  - Sensitivität: einstellbar (0.3–3.0)

### 4.2 Aktor 1: Vibration (Haptisches Feedback)

- **Bibliothek:** `react-native` (Vibration API)
- **Verwendung:** Feedback bei Kollisionen oder Spielereignissen
- **Implementierung:** `src/screens/GameScreen.tsx`

## 5. Persistente Speicherung

- **Technologie:** Firebase Realtime Database
- **Datenmodell:** Siehe [03_loesungskonzept.md](./03_loesungskonzept.md)
- **Operationen:**
  - Schreiben: Bestzeiten, Nicknames
  - Lesen: Highscores, eigene Bestzeit

## 6. Authentifizierung

- **Technologie:** Firebase Authentication
- **Methoden:**
  - Google Sign-In (OAuth 2.0)
  - Anonyme Anmeldung (Firebase Anonymous Auth)
  - Gastmodus (ohne Authentifizierung, keine Datenspeicherung)
- **Konfiguration:** `src/config/firebase.ts`

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335*
