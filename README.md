# Kompetenznachweis Modul 335 – Mobile Applikation realisieren

## Projektdokumentation: Tilt Maze

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
| **LoginScreen** | Anmeldebildschirm mit Optionen für Google-Login, anonyme Anmeldung oder Gastmodus | → MenuScreen |
| **MenuScreen** | Hauptmenü mit Willkommensnachricht, Nickname-Bearbeitung (für angemeldete Benutzer) und Navigation zu Spiel oder Bestenliste | → GameScreen, → HighscoresScreen, → LoginScreen (Logout) |
| **GameScreen** | Spielbildschirm mit Labyrinth, beweglicher Kugel, Zielfeld, Timer und Einstellungen für Neigungssteuerung | → ResultScreen (bei Spielende), → MenuScreen (Zurück) |
| **ResultScreen** | Ergebnisanzeige mit Zeit, Speicherstatus (neuer Rekord / nicht Rekord) und Optionen für erneutes Spielen | → GameScreen, → HighscoresScreen, → MenuScreen |
| **HighscoresScreen** | Bestenliste mit Top 10 Spielzeiten, sortiert nach kürzester Zeit | → MenuScreen |

#### Auflistung aller Funktionalitäten

1. **Benutzerauthentifizierung**
   - Google Sign-In
   - Anonyme Anmeldung
   - Gastmodus (ohne Speicherung)

2. **Spielfunktionen**
   - Kugelsteuerung durch Geräteneigung (Accelerometer)
   - Physik-Engine für realistische Kugelbewegung
   - Labyrinth mit Hindernissen (Wände)
   - Kollisionserkennung (Wände und Zielfeld)
   - Zeitmessung mit Millisekunden-Genauigkeit
   - Einstellbare Steuerungsparameter (Sensitivität, Deadzone, Glättung)

3. **Datenspeicherung**
   - Speicherung der Bestzeiten in Firebase Realtime Database
   - Nickname-Verwaltung pro Benutzer
   - Automatische Aktualisierung bei neuer Bestzeit

4. **Bestenliste**
   - Anzeige der Top 10 Spieler mit kürzesten Zeiten
   - Farbliche Hervorhebung der Podiumsplätze (Gold, Silber, Bronze)

---

### 2.2 Verwendete Elemente

#### Sensoren/Aktoren (mindestens 2)

| Sensor/Aktor | Beschreibung | Verwendung in der App |
|--------------|--------------|----------------------|
| **Accelerometer (Beschleunigungssensor)** | Misst die Beschleunigung des Geräts in drei Achsen (x, y, z). | Die x- und y-Achsen werden verwendet, um die Neigung des Geräts zu erfassen. Diese Werte steuern die Gravitation in der Physik-Engine, wodurch sich die Kugel in Neigungsrichtung bewegt. Die z-Achse wird für das 2D-Spielkonzept ignoriert. |
| **Vibration (Haptic Feedback)** | Erzeugt taktiles Feedback durch Vibration des Geräts. | Kann bei Kollisionen mit Wänden oder beim Erreichen des Ziels aktiviert werden, um den Spielenden ein physisches Feedback zu geben. (Erweiterungsmöglichkeit) |

**Technische Details zum Accelerometer:**
- Update-Intervall: 50 ms (20 Updates pro Sekunde)
- Deadzone: 0.05 (kleine Bewegungen werden ignoriert)
- Glättung: Alpha-Wert 0.3 (Tiefpassfilter)
- Sensitivität: Einstellbar zwischen 0.3 und 3.0

#### Persistente Speicherung

| Technologie | Begründung |
|-------------|------------|
| **Firebase Realtime Database** | Firebase bietet eine serverlose, echtzeitfähige NoSQL-Datenbank, die sich ideal für die Speicherung von Spielständen und Benutzerdaten eignet. Die Synchronisation erfolgt automatisch über alle Geräte, und die Integration mit Firebase Authentication ermöglicht eine nahtlose Benutzerverwaltung. Die kostenlose Stufe (Spark Plan) ist für die Anforderungen dieser App ausreichend. |

**Datenbankstruktur:**
```
├── users/
│   └── {userId}/
│       └── nickname: "Spielername"
│
└── scores/
    └── {userId}/
        ├── userId: "abc123"
        ├── email: "benutzer@beispiel.ch"
        ├── nickname: "Spielername"
        ├── time: 5420 (Millisekunden)
        └── timestamp: 1704902400000
```

#### Authentifizierung

| Technologie | Begründung |
|-------------|------------|
| **Firebase Authentication** | Firebase Authentication bietet mehrere Anmeldemethoden (Google, anonym) in einem einheitlichen API. Die Integration mit der Firebase Realtime Database ermöglicht eine sichere Zuordnung von Benutzerdaten. Die SDK übernimmt Token-Management und Session-Handling automatisch. |

**Unterstützte Anmeldemethoden:**
- Google Sign-In (OAuth 2.0)
- Anonyme Anmeldung
- Gastmodus (ohne Firebase-Authentifizierung)

---

### 2.3 Testplan

| Testfall-Nr. | Beschreibung | Erwartetes Resultat | Effektives Resultat | Status |
|--------------|--------------|---------------------|---------------------|--------|
| T01 | Anmeldung mit Google Sign-In | Erfolgreiche Authentifizierung, Weiterleitung zum Menü | Erfolgreiche Anmeldung, Benutzer wird im Menü begrüsst | OK |
| T02 | Anonyme Anmeldung | Erfolgreiche Authentifizierung, Weiterleitung zum Menü | Anonymer Benutzer wird erstellt und zum Menü weitergeleitet | OK |
| T03 | Gastmodus starten | Spielen ohne Anmeldung möglich, Warnung dass Punkte nicht gespeichert werden | Gastmodus funktioniert, Warnhinweis wird angezeigt | OK |
| T04 | Kugelsteuerung durch Neigung | Kugel bewegt sich in Neigungsrichtung des Geräts | Kugel reagiert korrekt auf Neigung in alle Richtungen | OK |
| T05 | Kollisionserkennung mit Wänden | Kugel prallt von Wänden ab, kann Spielfeld nicht verlassen | Kollisionen werden erkannt, Kugel bleibt im Spielfeld | OK |
| T06 | Ziel erreichen | Timer stoppt, Gewinn-Nachricht erscheint, Weiterleitung zu Ergebnissen | «You Won!» wird angezeigt, automatische Weiterleitung nach 0.5 Sekunden | OK |
| T07 | Bestzeit speichern (neue Bestzeit) | Zeit wird gespeichert, Nachricht «New Personal Best!» erscheint | Speicherung erfolgreich, Bestätigungsnachricht wird angezeigt | OK |
| T08 | Bestzeit speichern (langsamer als Bestzeit) | Bestehende Zeit bleibt erhalten, Hinweis zum Weiterüben | Bestzeit bleibt unverändert, Motivationsnachricht erscheint | OK |
| T09 | Bestenliste laden | Top 10 Zeiten werden sortiert angezeigt | Zeiten werden korrekt geladen und nach Zeit aufsteigend sortiert | OK |
| T10 | Nickname speichern | Nickname wird in Datenbank gespeichert und in Bestenliste angezeigt | Nickname wird gespeichert und in Bestenliste korrekt angezeigt | OK |
| T11 | Logout-Funktion | Benutzer wird abgemeldet, Weiterleitung zum Login-Screen | Abmeldung erfolgreich, Login-Screen wird angezeigt | OK |
| T12 | Steuerungseinstellungen anpassen | Änderungen an Sensitivität/Deadzone werden sofort wirksam | Einstellungen können im Spiel angepasst werden und wirken sich direkt aus | OK |
| T13 | App im Hintergrund und Vordergrund | Spielzustand bleibt erhalten oder wird korrekt zurückgesetzt | Spiel wird bei Rückkehr in den Vordergrund fortgesetzt | OK |
| T14 | Keine Internetverbindung beim Login | Fehlermeldung wird angezeigt | Fehlermeldung wird korrekt angezeigt | OK |
| T15 | Timer-Funktion | Timer zählt in Echtzeit hoch und zeigt korrekte Zeit an | Timer wird alle 100ms aktualisiert, Anzeige im Format X.XXs | OK |

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
| Benutzerauthentifizierung | ✅ Umgesetzt | LoginScreen.tsx mit Google OAuth, anonymer Anmeldung und Gastmodus |
| Kugelsteuerung | ✅ Umgesetzt | GameScreen.tsx mit Accelerometer und matter-js Physik-Engine |
| Labyrinth mit Hindernissen | ✅ Umgesetzt | Drei horizontale Maze-Wände mit Kollisionserkennung |
| Zeitmessung | ✅ Umgesetzt | Millisekunden-genauer Timer mit 100ms Aktualisierung |
| Bestzeit-Speicherung | ✅ Umgesetzt | ResultScreen.tsx mit Firebase Realtime Database |
| Bestenliste | ✅ Umgesetzt | HighscoresScreen.tsx mit Top 10 Anzeige |
| Nickname-System | ✅ Umgesetzt | MenuScreen.tsx mit Bearbeitung und Speicherung |
| Steuerungseinstellungen | ✅ Umgesetzt | In-Game Settings Modal mit Live-Anpassung |

### Umsetzung der Sensoren

**Accelerometer:**
- Expo Sensors Library für plattformübergreifenden Zugriff
- Nur x- und y-Achse verwendet (z-Achse für 2D-Spiel irrelevant)
- Tiefpassfilter für Glättung implementiert
- Konfigurierbares Update-Intervall (20–100ms)
- Deadzone zur Vermeidung von Jitter bei ruhig gehaltenem Gerät

**Physikalische Parameter:**
- Ball-Radius: 15 Pixel
- Ziel-Radius: 30 Pixel
- Restitution (Bounciness): 0.7
- Friction: 0.05
- Air Friction: 0.02

### Einhaltung der gesetzten Ziele

| Ziel | Erreicht | Anmerkung |
|------|----------|-----------|
| Intuitive Neigungssteuerung | ✅ | Anpassbare Sensitivität, Inversion und Deadzone |
| Physikalisch realistische Kugelbewegung | ✅ | matter-js Engine mit Reibung und Kollisionen |
| Benutzeridentifikation | ✅ | Google Login, Anonym Login, Gastmodus |
| Persistente Speicherung | ✅ | Firebase Realtime Database |
| Wettbewerb durch Bestenliste | ✅ | Top 10 mit Podium-Hervorhebung |

### Verwaltung des Projekts über GitHub

Das Projekt wird vollständig über GitHub verwaltet:

- **Repository:** [App-M335](https://github.com/RiciYT/App-M335)
- **Branches:** Main-Branch für stabile Releases, Feature-Branches für Entwicklung
- **Commits:** Regelmässige Commits mit aussagekräftigen Nachrichten
- **Dokumentation:** README.md, ARCHITECTURE.md, FIREBASE_SETUP.md, TESTING.md, QUICKSTART.md

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

### Weitere Dokumentation

- [ARCHITECTURE.md](ARCHITECTURE.md) – Detaillierte Architektur-Dokumentation
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) – Anleitung zur Firebase-Konfiguration
- [TESTING.md](TESTING.md) – Ausführliche Testanleitung
- [QUICKSTART.md](QUICKSTART.md) – Kurzanleitung für den Schnellstart

### Quellenverzeichnis

- [React Native Dokumentation](https://reactnative.dev/)
- [Expo Dokumentation](https://docs.expo.dev/)
- [Firebase Dokumentation](https://firebase.google.com/docs)
- [matter-js Dokumentation](https://brm.io/matter-js/)

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335 – Mobile Applikation realisieren*