# Abgabe-Anleitung – Modul 335

## Überblick

Dieses Verzeichnis enthält alle abgaberelevanten Dateien für den Kompetenznachweis Modul 335.

## Inhalt

| Datei | Beschreibung | Status |
|-------|--------------|--------|
| `dokumentation.pdf` | Vollständige Projektdokumentation als PDF | ✅ Vorhanden |
| `project.zip` | Projekt-Archiv ohne node_modules | ✅ Vorhanden |
| `selbstbewertung.xlsx` | Selbstbewertung der Kompetenzen | ✅ Vorhanden |
| `apk_link.txt` | Link zum APK-Download (EAS Build) | ✅ Vorhanden |

## Abgabeform

### Option 1: GitHub Repository (empfohlen)

Das gesamte Repository ist unter [https://github.com/RiciYT/App-M335](https://github.com/RiciYT/App-M335) verfügbar.

**Was ist wo:**
- **Dokumentation (Markdown)**: `/docs/*.md`
- **Dokumentation (PDF)**: `/deliverables/dokumentation.pdf`
- **APK-Link**: `/deliverables/apk_link.txt`
- **Projekt-ZIP**: `/deliverables/project.zip`
- **Selbstbewertung**: `/deliverables/selbstbewertung.xlsx`
- **Quellcode**: Gesamtes Repository

### Option 2: ZIP-Datei

Falls ZIP-Abgabe erforderlich:
1. `project.zip` herunterladen (enthält vollständiges Projekt ohne node_modules)
2. Entpacken und Anleitung in README.md befolgen

## Projekt-ZIP erstellen (Reproduktion)

Das Projekt-ZIP wurde mit folgendem Befehl erstellt:

```bash
# Im Projektverzeichnis
zip -r deliverables/project.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".expo/*" \
  -x "dist/*" \
  -x "*.log" \
  -x ".DS_Store"
```

**Alternativ mit git archive:**

```bash
git archive --format=zip --output=deliverables/project.zip HEAD
```

## APK Installation

1. Link aus `apk_link.txt` öffnen
2. APK-Datei herunterladen
3. Auf Android-Gerät übertragen
4. Installation aus unbekannten Quellen erlauben (Einstellungen)
5. APK installieren und App starten

## Setup für Entwicklung

Siehe [../README.md](../README.md) für detaillierte Setup-Anleitung.

Kurz:
```bash
npm install
npm start
```

## Dokumentation

Die vollständige Dokumentation ist verfügbar als:
- **PDF**: `dokumentation.pdf` (dieses Verzeichnis)
- **Markdown**: `/docs/*.md` (im Repository)

### Dokumentations-Struktur

1. **01_planung.md** – Funktionsliste, Storyboard, Sensoren, Auth, Storage
2. **02_testplan.md** – Use Cases und Testfälle
3. **03_loesungskonzept.md** – Framework, Architektur, Details
4. **04_build_apk_eas.md** – APK-Build mit EAS (Schritt für Schritt)
5. **05_testbericht.md** – Testdurchführung, Ergebnisse, Korrekturen

Die PDF wurde mit pandoc erstellt:
```bash
pandoc docs/*.md -o deliverables/dokumentation.pdf \
  --toc \
  --toc-depth=3 \
  --metadata title="Tilt Maze - Kompetenznachweis M335"
```

## Selbstbewertung

Die Selbstbewertung befindet sich in `selbstbewertung.xlsx` und enthält:
- Bewertung aller Kompetenzen gemäss Kompetenzraster
- Selbsteinschätzung mit Begründung
- Verweise auf entsprechende Code-/Dokumentationsstellen

## Anforderungs-Mapping

Eine detaillierte Tabelle mit Mapping aller Anforderungen zu Dateien/Abschnitten befindet sich im [../README.md](../README.md).

## Kontakt

Bei Fragen zum Projekt:
- **Repository**: https://github.com/RiciYT/App-M335
- **Issues**: https://github.com/RiciYT/App-M335/issues

---

*Erstellt im Rahmen des Kompetenznachweises Modul 335 – Mobile Applikation realisieren*
