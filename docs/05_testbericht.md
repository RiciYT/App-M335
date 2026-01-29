# Testbericht – Tilt Maze

## 1. Testübersicht

| Eigenschaft | Wert |
|-------------|------|
| **Testdatum** | Januar 2026 |
| **Tester** | Entwickler |
| **Getestete Version** | 1.0.0 |
| **Testgerät** | Android-Smartphone (physisch) |
| **OS-Version** | Android 14 |
| **Test-Umgebung** | APK Build (EAS Preview) |

## 2. Testergebnisse

### 2.1 Authentifizierung

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T01 | Google Sign-In | ✅ OK | Anmeldung funktioniert, Weiterleitung zum Menü |
| T02 | Logout | ✅ OK | Abmeldung erfolgreich, Login-Screen erscheint |
| T03 | Kein Internet beim Login | ✅ OK | Fehlermeldung wird angezeigt |

**Fazit Authentifizierung:** Alle Tests bestanden (3/3)

### 2.2 Navigation

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T04 | Menü zu Spiel | ✅ OK | Game-Screen lädt korrekt |
| T05 | Menü zu Highscores | ✅ OK | Highscores werden angezeigt |
| T06 | Zurück zum Menü | ✅ OK | Navigation funktioniert auf allen Screens |

**Fazit Navigation:** Alle Tests bestanden (3/3)

### 2.3 Spielmechanik

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T07 | Kugelsteuerung links | ✅ OK | Reaktion korrekt |
| T08 | Kugelsteuerung rechts | ✅ OK | Reaktion korrekt |
| T09 | Kollision mit Wand | ✅ OK | Kugel prallt ab |
| T10 | Ziel erreichen | ✅ OK | «You Won!» erscheint, Timer stoppt |
| T11 | Timer-Funktion | ✅ OK | Zählt korrekt in Echtzeit |
| T12 | Vibration bei Ereignis | ✅ OK | Haptisches Feedback funktioniert (wenn aktiviert) |
| T13 | Kalibrierung | ✅ OK | Nullpunkt wird korrekt gesetzt |

**Fazit Spielmechanik:** Alle Tests bestanden (7/7)

### 2.4 Steuerungseinstellungen

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T14 | Sensitivität ändern | ✅ OK | Änderung wirkt sich aus |
| T15 | X-Achse invertieren | ✅ OK | Steuerung wird umgekehrt |
| T16 | Vibration umschalten | ✅ OK | Ein-/Ausschalten funktioniert |
| T17 | Sound umschalten | ✅ OK | Musik wird aktiviert/deaktiviert |

**Fazit Einstellungen:** Alle Tests bestanden (4/4)

### 2.5 Datenspeicherung

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T18 | Erste Bestzeit speichern | ✅ OK | «New Personal Best!» wird angezeigt |
| T19 | Neue Bestzeit (schneller) | ✅ OK | Zeit wird aktualisiert |
| T20 | Keine neue Bestzeit | ✅ OK | Alte Bestzeit bleibt erhalten |
| T21 | Nickname speichern | ✅ OK | Nickname erscheint in Highscores |
| T22 | Settings speichern | ✅ OK | AsyncStorage funktioniert korrekt |

**Fazit Datenspeicherung:** Alle Tests bestanden (5/5)

### 2.6 Bestenliste

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T23 | Highscores laden | ✅ OK | Top 10 werden korrekt sortiert angezeigt |
| T24 | Leere Bestenliste | ✅ OK | Hinweis erscheint |
| T25 | Podium-Anzeige | ✅ OK | Gold/Silber/Bronze-Hervorhebung funktioniert |

**Fazit Bestenliste:** Alle Tests bestanden (3/3)

### 2.7 Sonderfälle / Edge Cases

| Nr. | Testfall | Ergebnis | Bemerkung |
|-----|----------|----------|-----------|
| T26 | App in Hintergrund | ✅ OK | Spielzustand wird zurückgesetzt |
| T27 | Schnelle Gerätebewegungen | ✅ OK | Kugel verhält sich stabil |
| T28 | Offline-Modus | ✅ OK | Fehlermeldung bei Speicherversuch |

**Fazit Edge Cases:** Alle Tests bestanden (3/3)

## 3. Gesamtergebnis

| Bereich | Bestanden | Gesamt | Prozent |
|---------|-----------|--------|---------|
| Authentifizierung | 3 | 3 | 100% |
| Navigation | 3 | 3 | 100% |
| Spielmechanik | 7 | 7 | 100% |
| Einstellungen | 4 | 4 | 100% |
| Datenspeicherung | 5 | 5 | 100% |
| Bestenliste | 3 | 3 | 100% |
| Edge Cases | 3 | 3 | 100% |
| **GESAMT** | **28** | **28** | **100%** |
| Edge Cases | 3 | 3 | 100% |
| **Total** | **26** | **26** | **100%** |

## 4. Gefundene und behobene Fehler

### 4.1 Fehler während der Entwicklung (behoben)

| Nr. | Beschreibung | Lösung | Status |
|-----|--------------|--------|--------|
| B01 | Kugel reagierte nicht intuitiv auf Neigung | INVERT_X/Y Optionen implementiert | ✅ Behoben |
| B02 | Jitter bei ruhig gehaltenem Gerät | Deadzone-Funktion implementiert | ✅ Behoben |
| B03 | Ungleichmässige Bewegung | Tiefpassfilter (Smoothing) hinzugefügt | ✅ Behoben |
| B04 | Z-Achse beeinflusste Steuerung | Z-Achse explizit ignoriert | ✅ Behoben |
| B05 | Timer nicht präzise genug | Update-Intervall auf 100ms gesetzt | ✅ Behoben |

### 4.2 Bekannte Einschränkungen

| Nr. | Beschreibung | Workaround |
|-----|--------------|------------|
| L01 | Accelerometer funktioniert nicht auf Emulatoren | Physisches Gerät verwenden |
| L02 | Web-Version ohne Sensor-Unterstützung | Nur auf mobilen Geräten testen |

## 5. Nicht-funktionale Tests

| Nr. | Testfall | Ergebnis | Messwert |
|-----|----------|----------|----------|
| N01 | Performance (60s Spielzeit) | ✅ OK | Konstant >30 FPS |
| N02 | Reaktionszeit Sensor | ✅ OK | <100ms |
| N03 | Firebase-Antwortzeit | ✅ OK | ~1-2 Sekunden |

## 6. Screenshots

### 6.1 Login-Screen
Der Login-Screen zeigt den Google Sign-In Button mit Neon-Cyan Design.

### 6.2 Game-Screen
Das Spielfeld zeigt die Kugel (cyan), das Ziel (grün) und die Maze-Wände.

### 6.3 Highscores-Screen
Die Bestenliste zeigt die Top 10 mit Podium-Hervorhebung.

*Hinweis: Screenshots wurden während der manuellen Tests erstellt und können auf Anfrage bereitgestellt werden.*

## 7. Fazit

Die App «Tilt Maze» hat alle 26 funktionalen Testfälle bestanden. Die Implementierung entspricht den Anforderungen des Kompetenznachweises:

- ✅ **2 Sensoren/Aktoren**: Accelerometer und Vibration
- ✅ **Persistente Speicherung**: Firebase Realtime Database
- ✅ **Authentifizierung**: Firebase Auth mit Google Sign-In
- ✅ **Funktionale App**: Alle Features arbeiten wie spezifiziert

**Gesamtstatus: BESTANDEN**

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335*
