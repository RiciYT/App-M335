# Testplan – Tilt Maze

## 1. Testübersicht

Dieser Testplan beschreibt die funktionalen Testfälle für die App «Tilt Maze». Die Testfälle sind aus den Use-Cases und der Funktionsliste abgeleitet.

## 2. Testumgebung

| Aspekt | Spezifikation |
|--------|---------------|
| Gerät | Android-Smartphone (physisches Gerät empfohlen) |
| Betriebssystem | Android 10+ |
| Test-App | Expo Go / APK Build |
| Netzwerk | WLAN (für Firebase-Zugriff) |

## 3. Funktionale Testfälle

### 3.1 Authentifizierung

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T01 | Google Sign-In | App gestartet, Login-Screen angezeigt | «Mit Google anmelden» tippen, Google-Konto wählen | Erfolgreiche Authentifizierung, Weiterleitung zum Menü |
| T02 | Logout | Benutzer ist eingeloggt, Menü-Screen angezeigt | Settings öffnen, «Logout» tippen | Benutzer wird abgemeldet, Login-Screen wird angezeigt |
| T03 | Kein Internet beim Login | Internetverbindung deaktiviert | Login-Versuch | Fehlermeldung wird angezeigt |

### 3.2 Navigation

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T04 | Menü zu Spiel | Menü-Screen angezeigt | «Spiel starten» tippen | Game-Screen wird geladen |
| T05 | Menü zu Highscores | Menü-Screen angezeigt | «Highscores» tippen | Highscores-Screen wird angezeigt |
| T06 | Zurück zum Menü | Beliebiger Screen | Zurück-Button tippen | Rückkehr zum Menü |

### 3.3 Spielmechanik

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T07 | Kugelsteuerung links | Spiel gestartet | Gerät nach links neigen | Kugel bewegt sich nach links |
| T08 | Kugelsteuerung rechts | Spiel gestartet | Gerät nach rechts neigen | Kugel bewegt sich nach rechts |
| T09 | Kollision mit Wand | Kugel in Bewegung Richtung Wand | Kugel erreicht Wand | Kugel prallt ab, bleibt im Spielfeld |
| T10 | Ziel erreichen | Spiel gestartet | Kugel ins Zielfeld navigieren | «You Won!» wird angezeigt, Timer stoppt |
| T11 | Timer-Funktion | Spiel gestartet | Beobachten | Timer zählt in Echtzeit hoch (0.00s → ...) |
| T12 | Vibration bei Ereignis | Vibration aktiviert | Kollision oder Spielende | Gerät vibriert kurz |
| T13 | Kalibrierung | Spiel gestartet | Kalibrierungs-Button tippen | Aktuelle Geräteposition wird als Nullpunkt gesetzt |

### 3.4 Steuerungseinstellungen

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T14 | Sensitivität ändern | Settings-Screen geöffnet | Sensitivität-Wert ändern | Steuerung reagiert empfindlicher/träger |
| T15 | X-Achse invertieren | Settings-Screen geöffnet | «Invert X» aktivieren | Steuerung horizontal umgekehrt |
| T16 | Vibration umschalten | Settings-Screen geöffnet | Vibration ein/aus | Vibration wird aktiviert/deaktiviert |
| T17 | Sound umschalten | Settings-Screen geöffnet | Sound ein/aus | Hintergrundmusik wird aktiviert/deaktiviert |

### 3.5 Datenspeicherung

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T18 | Erste Bestzeit speichern | Eingeloggt, noch keine Zeit gespeichert | Spiel abschliessen | «New Personal Best!» wird angezeigt, Zeit in DB gespeichert |
| T19 | Neue Bestzeit (schneller) | Bestzeit existiert | Spiel schneller abschliessen | «New Personal Best!» erscheint, DB aktualisiert |
| T20 | Keine neue Bestzeit (langsamer) | Bestzeit existiert | Spiel langsamer abschliessen | Hinweis zum Weiterüben, alte Bestzeit bleibt |
| T21 | Nickname speichern | Eingeloggt, Menü angezeigt | Nickname bearbeiten und speichern | Nickname wird in DB gespeichert |
| T22 | Settings speichern | Settings-Screen geöffnet | Einstellungen ändern, zurück navigieren | Einstellungen werden in AsyncStorage gespeichert und beim Neustart geladen |

### 3.6 Bestenliste

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T23 | Highscores laden | Scores in Datenbank vorhanden | Highscores-Screen öffnen | Top 10 werden angezeigt, sortiert nach Zeit |
| T24 | Leere Bestenliste | Keine Scores in Datenbank | Highscores-Screen öffnen | Hinweis «Keine Scores vorhanden» |
| T25 | Podium-Anzeige | Mind. 3 Scores vorhanden | Highscores-Screen öffnen | Top 3 mit Gold/Silber/Bronze hervorgehoben |

### 3.7 Sonderfälle / Edge Cases

| Nr. | Testfall | Vorbedingung | Aktion | Erwartetes Resultat |
|-----|----------|--------------|--------|---------------------|
| T26 | App in Hintergrund | Spiel läuft | Home-Button drücken, App wieder öffnen | Spielzustand erhalten oder kontrolliert zurückgesetzt |
| T27 | Schnelle Gerätebewegungen | Spiel läuft | Gerät schnell schütteln | Kugel verhält sich stabil, kein Absturz |
| T28 | Offline-Modus | Keine Internetverbindung | Spiel abschliessen | Lokale Meldung, Speicherung scheitert mit Hinweis |

## 4. Nicht-funktionale Tests

| Nr. | Testfall | Beschreibung | Erwartetes Resultat |
|-----|----------|--------------|---------------------|
| N01 | Performance | Spiel 60 Sekunden spielen | Flüssige Animation (>30 FPS) |
| N02 | Reaktionszeit | Gerät neigen | Verzögerung < 100ms |
| N03 | Firebase-Antwortzeit | Score speichern | < 3 Sekunden |

## 5. Testprotokoll-Vorlage

```
Testdatum:     ________________
Tester:        ________________
Gerät:         ________________
OS-Version:    ________________
App-Version:   ________________

Testfall | Ergebnis | Bemerkung
---------|----------|----------
T01      | OK/NOK   |
T02      | OK/NOK   |
...      | ...      | ...

Gefundene Fehler:
1. 
2. 

Fazit:
```

## 6. Testabdeckung

| Bereich | Anzahl Testfälle | Abdeckung |
|---------|------------------|-----------|
| Authentifizierung | 3 | Vollständig |
| Navigation | 3 | Vollständig |
| Spielmechanik | 8 | Vollständig |
| Einstellungen | 2 | Exemplarisch |
| Datenspeicherung | 4 | Vollständig |
| Bestenliste | 3 | Vollständig |
| Edge Cases | 3 | Exemplarisch |
| **Total** | **26** | |

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335*
