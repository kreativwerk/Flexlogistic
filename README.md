# FlexLogistic

**Die Schnittstelle zwischen Industrie und Logistik.**

FlexLogistic ist eine Transportvermittlungs-Plattform (MVP), die Firmen/Verlader direkt mit
KEP-Dienstleistern und Kurierunternehmen verbindet – inspiriert von Onlogist und InTime,
aber bewusst einfacher.

## Funktionen

### Für Verlader (Industrie & Handel)
- Transporte in wenigen Schritten ausschreiben: **Direktfahrt**, **Extra-Tour** oder **Feste Tour** (wiederkehrend, z. B. werktags)
- **Festpreis** mit automatischer Preisempfehlung (nach Fahrzeugklasse und Distanz) oder **Gebotsverfahren**
- Gebote vergleichen und mit einem Klick annehmen
- Live-Status je Auftrag: Offen → Vergeben → Abgeholt → Zugestellt (inkl. Empfängername als Ablieferbeleg)
- Stornierung offener und vergebener Aufträge

### Für Transportdienstleister (KEP / Kurier)
- **Frachtenbörse** mit Filtern nach Auftragsart, Fahrzeugklasse und PLZ
- Festpreis-Touren mit einem Klick übernehmen (Vergabe nach dem Windhundprinzip, doppelte Vergabe ausgeschlossen)
- Auf Gebots-Touren bieten und Gebote aktualisieren
- Feste Touren übernehmen → planbarer, wiederkehrender Umsatz
- Dashboard mit aktiven Touren und Umsatzübersicht

### Plattform
- Rollenbasierte Registrierung (Verlader / Fahrer) mit Fahrzeugklassen-Profil
- Kontaktdaten und exakte Adressen werden erst nach Vergabe für die Beteiligten sichtbar
- 7 Fahrzeugklassen vom PKW bis zum 40-Tonner mit hinterlegten km-Sätzen

## Tech-Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Actions) + React 19 + TypeScript
- Tailwind CSS 4
- SQLite über `better-sqlite3` – keine externen Dienste nötig, Datenbank wird beim ersten
  Start automatisch unter `data/flexlogistic.db` angelegt und mit Demo-Daten befüllt
- Eigene, schlanke Session-Authentifizierung (HMAC-signierte Cookies, bcrypt-Passwörter)

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build
npm start        # Produktionsserver
```

### Demo-Zugänge

| Rolle    | E-Mail             | Passwort   |
| -------- | ------------------ | ---------- |
| Verlader | `verlader@demo.de` | `demo1234` |
| Fahrer   | `fahrer@demo.de`   | `demo1234` |

Beim ersten Start werden außerdem drei Beispiel-Ausschreibungen angelegt
(Direktfahrt, Extra-Tour mit Gebotsverfahren, feste Tour werktags).

## Datenmodell (Kurzüberblick)

- `users` – Verlader & Fahrer (Rolle, Firma, Kontakt, Fahrzeugklassen)
- `tours` – alle Aufträge (Art, Route, Zeitfenster bzw. Wochentage, Fahrzeugklasse, Preis-/Vergabemodus, Status, Zeitstempel)
- `bids` – Gebote der Fahrer auf Gebots-Touren (ein Gebot je Fahrer und Tour, aktualisierbar)

## Roadmap-Ideen

- Automatische Distanzberechnung & Geocoding (z. B. OpenRouteService)
- Dokumente: Frachtbrief/POD-Foto-Upload, Rechnungsstellung & Gutschriftverfahren
- Benachrichtigungen (E-Mail/Push) bei neuen passenden Touren und Geboten
- Bewertungen & Verifizierung (Gewerbeschein, Versicherungsnachweis)
- Mobile App / PWA für Fahrer mit Live-Tracking
