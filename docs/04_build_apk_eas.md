# Build APK mit EAS – Tilt Maze

## 1. Übersicht

Diese Anleitung beschreibt die Schritte zur Erstellung einer Android APK-Datei mit **Expo Application Services (EAS)**. Die APK kann direkt auf Android-Geräten installiert werden (ohne Google Play Store).

## 2. Voraussetzungen

### 2.1 Installierte Software

- **Node.js** (Version 18+)
- **npm** oder **yarn**
- **EAS CLI** (wird global installiert)

### 2.2 Konten

- **Expo-Konto** (kostenlos): [expo.dev](https://expo.dev)
- Optional: **Google Play Developer Account** (für Store-Veröffentlichung)

## 3. Einrichtung

### 3.1 EAS CLI installieren

```bash
npm install -g eas-cli
```

### 3.2 Bei Expo anmelden

```bash
eas login
```

Gib deine Expo-Zugangsdaten ein.

### 3.3 Projekt mit EAS verknüpfen (einmalig)

```bash
eas build:configure
```

Dies erstellt/aktualisiert die `eas.json`-Datei im Projektverzeichnis.

## 4. Build-Konfiguration

### 4.1 eas.json

Die Datei `eas.json` im Projektroot definiert die Build-Profile:

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

| Eigenschaft | Wert | Beschreibung |
|-------------|------|--------------|
| `distribution` | `internal` | APK für interne Verteilung (nicht Play Store) |
| `buildType` | `apk` | Erstellt eine direkt installierbare APK-Datei |

### 4.2 app.json (Auszug)

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
    },
    "extra": {
      "eas": {
        "projectId": "ea02cbdc-02ce-4529-a804-2cfd1dcc00c9"
      }
    }
  }
}
```

## 5. APK erstellen

### 5.1 Build-Befehl (Preview-Profil)

```bash
eas build --platform android --profile preview
```

**Alternativer Kurzbefehl:**

```bash
eas build -p android --profile preview
```

### 5.2 Build-Prozess

1. **Upload**: Der Code wird zu Expo-Servern hochgeladen
2. **Queue**: Der Build wird in die Warteschlange eingereiht
3. **Build**: Die APK wird auf Expo-Servern kompiliert (~5-15 Minuten)
4. **Download**: Nach Abschluss erhältst du einen Download-Link

### 5.3 Build-Status prüfen

```bash
eas build:list
```

Oder im Browser: [expo.dev/accounts/[username]/builds](https://expo.dev)

## 6. APK herunterladen und installieren

### 6.1 Download

Nach erfolgreichem Build erscheint ein Link in der Konsole:

```
✔ Build finished.

🤖 Android build: https://expo.dev/artifacts/eas/xxxxx.apk
```

Klicke auf den Link oder kopiere ihn in den Browser.

### 6.2 Installation auf Android-Gerät

1. **APK auf Gerät übertragen** (USB, Cloud, etc.)
2. **Installation aus unbekannten Quellen erlauben** (in den Einstellungen)
3. **APK-Datei öffnen** und «Installieren» tippen
4. **App starten**

## 7. Fehlerbehebung

### 7.1 Häufige Fehler

| Fehler | Lösung |
|--------|--------|
| `eas: command not found` | EAS CLI installieren: `npm install -g eas-cli` |
| `Not logged in` | `eas login` ausführen |
| `Missing projectId` | `eas build:configure` ausführen |
| Build-Timeout | Expo-Serverstatus prüfen: [status.expo.dev](https://status.expo.dev) |

### 7.2 Credentials

Für den ersten Build generiert EAS automatisch einen Debug-Keystore. Für Produktions-Builds kannst du eigene Keystores verwenden:

```bash
eas credentials
```

## 8. Alternative Build-Profile

### 8.1 Development Build (mit Dev Client)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

```bash
eas build --platform android --profile development
```

### 8.2 Production Build (AAB für Play Store)

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

```bash
eas build --platform android --profile production
```

## 9. Zusammenfassung der Befehle

| Aktion | Befehl |
|--------|--------|
| EAS CLI installieren | `npm install -g eas-cli` |
| Bei Expo anmelden | `eas login` |
| Projekt konfigurieren | `eas build:configure` |
| **APK erstellen** | `eas build --platform android --profile preview` |
| Build-Liste anzeigen | `eas build:list` |
| Credentials verwalten | `eas credentials` |

## 10. Weiterführende Links

- [EAS Build Dokumentation](https://docs.expo.dev/build/introduction/)
- [eas.json Referenz](https://docs.expo.dev/build/eas-json/)
- [Android-spezifische Konfiguration](https://docs.expo.dev/build-reference/apk/)
- [Expo Status](https://status.expo.dev/)

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335*
