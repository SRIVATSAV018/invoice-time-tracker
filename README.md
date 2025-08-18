# Invoice Time Tracker – Rechnungen, Projekte, Zeiterfassung

[![Releases](https://img.shields.io/badge/Releases-Download-blue?logo=github)](https://github.com/SRIVATSAV018/invoice-time-tracker/releases)

Lade die Datei von https://github.com/SRIVATSAV018/invoice-time-tracker/releases herunter und führe sie aus.

Kurz: Webtool zur Verwaltung von Kunden, Projekten, Angeboten und Rechnungen mit integrierter Zeiterfassung. Zielgruppe: Solo-Selbstständige, die ohne externe Dienste ihren Arbeitsalltag organisieren wollen.

---

Badges
- [![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
- [![Build](https://img.shields.io/badge/Stack-Laravel%20%7C%20React-blue)](https://laravel.com)
- Topics: inertiajs, invoicing, laravel, mysql, pdf-generation, queue, react, sqlite, tailwindcss, time-tracking

Screenshots
- Dashboard:  
  ![Dashboard](https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=60)
- Zeitbuchung & Stoppuhr:  
  ![Time Tracking](https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=60)
- Rechnungsvorschau (PDF):  
  ![Invoice PDF](https://images.unsplash.com/photo-1580910051070-02f5a9b3d4e4?auto=format&fit=crop&w=1200&q=60)

Features
- Kundenverwaltung (Kontakte, Adressen, Zahlungsbedingungen)
- Projektverwaltung (Stundenprofile, Budget, Phasen)
- Angebote erstellen und in Rechnungen umwandeln
- Rechnungen als PDF erzeugen und als ZIP exportieren
- Integrierte Zeiterfassung mit Stoppuhr und manuellen Einträgen
- Stundenzettel pro Projekt und Kunde
- Warteschlangen für PDF-Generierung und E-Mail-Versand (Queue/Jobs)
- Mehrere DB-Optionen: SQLite für lokale Tests, MySQL für Produktion
- Authentifizierung, Rollen und Berechtigungen
- API-Endpunkte für Mobilzugriff (REST)
- Theme mit Tailwind CSS, Frontend mit Inertia + React

Warum dieses Tool
- Keine externe Abhängigkeit für Abrechnung oder Zeiterfassung.
- Vollständige Kontrolle über Daten und Backups.
- Minimaler Overhead. Fokus auf Solo-Unternehmer.

Kurzanleitung — Lokale Entwicklung (Linux/macOS/WSL)
1. Voraussetzungen
   - PHP 8.0+
   - Composer
   - Node.js 16+
   - MySQL oder SQLite
   - Redis (optional für Queue)
   - Git

2. Repository klonen
```bash
git clone https://github.com/SRIVATSAV018/invoice-time-tracker.git
cd invoice-time-tracker
```

3. Abhängigkeiten installieren
```bash
composer install
npm install
```

4. Umgebungsdatei
```bash
cp .env.example .env
php artisan key:generate
```
- Für SQLite: setze DB_CONNECTION=sqlite und lege file database/database.sqlite an.
- Für MySQL: setze DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD.

5. Datenbank & Seed
```bash
php artisan migrate --seed
```

6. Storage & Assets
```bash
php artisan storage:link
npm run build   # oder npm run dev für Live-Reload
```

7. Queue Worker
- Für lokale Tests:
```bash
php artisan queue:work --tries=3
```
- Für Produktion empfehle Supervisor oder systemd.

8. Start
```bash
php artisan serve --port=8000
# öffne http://localhost:8000
```

Docker (Option)
- Ein Docker-Compose-Setup liegt im Ordner docker/ bereit.  
- Kommandos:
```bash
docker-compose up --build -d
docker-compose exec app composer install
docker-compose exec app php artisan migrate --seed
```

Deployment
- Empfohlen: Linux-Server, PHP-FPM, Nginx, MySQL, Redis.
- Setze eine Queue-Worker-Instanz.
- Verwende Supervisord oder systemd für Prozesse.
- Sichere storage/ und database/ per Backup.

Datenmodell (Kurz)
- User: Auth, Rollen (admin, user)
- Client: Kundendaten, Steuersatz, Zahlungsziel
- Project: Kunde, Budget, Stundenprofil
- TimeEntry: Start, Ende, Pause, Projekt, Tätigkeit
- Offer: Positionen, MwSt, Status
- Invoice: Positionen, Zahlungseingänge, PDF-Pfad
- Job: PDF-Generierung, Mail-Versand

PDF-Generierung
- Libraries: Snappy/ wkhtmltopdf oder dompdf möglich (konfigurierbar)
- PDFs werden per Queue erzeugt.
- PDF-Datei wird im storage/ abgelegt und mit der Invoice verknüpft.

E-Mail
- Mailable-Klassen setzen Laravel-Queue ein.
- SMTP via .env konfigurieren.
- Beispiel:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=example
MAIL_PASSWORD=secret
MAIL_FROM_ADDRESS=info@example.com
```

Import / Export
- CSV-Import für Kunden und Projekte.
- Export: CSV für Berichte, ZIP für Rechnungen.

Backup & Migration
- Datenbank-Dumps via mysqldump oder sqlite copy.
- Storage: rsync oder S3.
- Migrations liegen in database/migrations.

API
- Basis-API mit Token-Authentifizierung (Laravel Sanctum).
- Endpunkte: /api/projects, /api/time-entries, /api/invoices
- Pagination und Filter per Query-String.

UI / UX
- Frontend-Bibliothek: Tailwind CSS.
- Seiten laden mit Inertia + React.
- Komponenten strukturiert in resources/js/Components.

Zeitbuchung (Nutzung)
- Start/Stopp über Stoppuhr-Button.
- Einträge später anpassen (Beschreibung, Dauer, Projekt).
- Buchungen visualisiert pro Projekt und Tag.
- Export der Stundenzettel als CSV oder PDF.

Rechnungen und Angebote
- Angebot erstellen > Positionen hinzufügen > als Rechnung konvertieren.
- Rechnung generieren > PDF erzeugen > per Mail senden.
- Zahlungseingänge anlegen > Zahlungsstatus wird aktualisiert.

Tests
- Unit-Tests: phpunit
- Beispiel:
```bash
php artisan test
```
- Feature-Tests für Kernfunktionen sind vorhanden.

Sicherheit
- Verschlüsselung von sensiblen Umgebungswerten via .env.
- Passwort-Hashing und Prepared Statements durch Laravel.
- Rollen-basierte Zugangskontrolle für Admin-Funktionen.

Konfiguration für MySQL vs SQLite
- SQLite ist ideal für lokale Tests. MySQL empfohlen für Produktion.
- .env-Beispiele:
```env
# SQLite
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite

# MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=invoice_tracker
DB_USERNAME=tracker_user
DB_PASSWORD=secret
```

Logging & Monitoring
- Log-Dateien in storage/logs.
- Für Produktion: centralisiertes Logging (Graylog/ELK) optional.
- Health-Check-Endpunkt /health für Load-Balancer.

Häufige Aufgaben
- Neue Rechnung erstellen: UI → Rechnungen → Neu
- Export der Monatsabrechnung: Reports → Zeitraum wählen → Export
- Automatische Mahnungen: Einstellungen → Mahnstufen aktivieren

Roadmap
- Offline-fähige Mobil-Views (PWA)
- Bankabgleich per CSV-Import
- Mehrsprachigkeit (DE/EN)
- Protokollierung (Audit-Log) für Rechnungsänderungen
- API-Erweiterung für Integrationen

Contributing
- Fork → Branch → Pull Request.
- Code-Style: PSR-12 für PHP, Prettier/ESLint für JS.
- Tests hinzufügen für neue Features.
- Issue-Templates existieren im .github/ Ordner.

Release-Install
- Lade die Release-Datei von https://github.com/SRIVATSAV018/invoice-time-tracker/releases herunter und führe sie aus.  
- Release-Pakete enthalten meist: source.zip, build assets, optionales Docker-Image oder installer.sh.  
- Führe die enthaltene Installationsdatei lokal oder auf dem Server aus. Beispiel:
```bash
# Nach Entpacken
sh installer.sh
```
- Verifiziere Rechte für storage/ und bootstrap/cache/.

Support
- Öffne Issues für Fehler und Feature-Requests.
- Pull Requests sind willkommen.

Lizenz
- MIT License. Siehe LICENSE-Datei.

Credits & Ressourcen
- Laravel: https://laravel.com
- Inertia: https://inertiajs.com
- Tailwind CSS: https://tailwindcss.com
- React: https://reactjs.org
- PDF: wkhtmltopdf / dompdf

Kontakt
- Projekt-Repository: https://github.com/SRIVATSAV018/invoice-time-tracker

Weiteres
- Checkliste: Backup, SSL, Queue-Worker, regelmäßige Cron-Jobs für Mahnungen und Reports.