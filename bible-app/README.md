# Offline Bible App

Eine vollständig offline nutzbare Bibel-Web-Anwendung mit React-Frontend und FastAPI-Backend. Die App liest freie Bibelübersetzungen im Zefania-XML-Format und stellt sie per Docker Compose lokal zur Verfügung – ideal für den Einsatz auf einer Synology NAS.

## Funktionsumfang

- 📖 Buch/Kapitel/Vers-Navigation ähnlich bibleserver.com
- 🔍 Volltextsuche mit Kontextauszügen
- 🌐 Mehrere Übersetzungen auswählbar (einfach neue XML-Dateien ablegen)
- 📱 Responsives Design für Desktop und Mobilgeräte
- 🚀 FastAPI-Backend mit In-Memory-Suchindex
- 🐳 Docker-Setup mit getrennten Frontend- und Backend-Services

## Projektstruktur

```
bible-app/
├── docker-compose.yml
├── data/
│   └── Luther1912_Psalm91.xml
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── search_index.py
│   │   └── providers/
│   │       └── zefania.py
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── App.tsx
        ├── api.ts
        ├── main.tsx
        ├── index.css
        ├── components/
        │   ├── BookPicker.tsx
        │   ├── ChapterPicker.tsx
        │   ├── SearchBar.tsx
        │   ├── SearchResults.tsx
        │   ├── TranslationPicker.tsx
        │   └── VerseList.tsx
        └── pages/
            ├── Home.tsx
            └── Reader.tsx
```

## Schnellstart

1. **Repository klonen**
   ```bash
   git clone <URL> bible-app
   cd bible-app
   ```
2. **Zefania-XML-Dateien hinzufügen**
   - Legen Sie Ihre freien Bibeltexte im Ordner `./data` ab.
   - Jede Datei muss die Endung `.xml` besitzen. Mehrere Übersetzungen werden automatisch erkannt.
3. **Container starten**
   ```bash
   docker compose up -d
   ```
4. **Aufrufen**
   - Frontend: http://<NAS-IP>:8080
   - API: http://<NAS-IP>:5000
   - Optional: Für lokale Entwicklung kann in `frontend/.env` die Variable `VITE_API_BASE_URL` gesetzt werden (Standard: `http://localhost:5000`).

> **Hinweis:** Beim Docker-Build wird die Umgebungsvariable `VITE_API_BASE_URL` automatisch auf `http://backend:5000` gesetzt, sodass das statische Frontend den internen API-Service anspricht.

## Deployment auf Synology NAS

1. Docker und Docker Compose aktivieren (Paket-Zentrum).
2. Dieses Repository z. B. via SSH oder File Station auf die NAS kopieren.
3. Zefania-XML-Dateien in `data/` einfügen.
4. Terminal (oder Aufgabenplaner) öffnen und im Projektverzeichnis `docker compose up -d` ausführen.
5. Firewall-Portfreigaben für 8080 (Frontend) und 5000 (Backend) setzen.

## Nutzung

- Startseite: Übersetzung wählen, danach Buch/Kapitel über die Sidebar auswählen.
- Leseransicht: Anzeige des aktuellen Kapitels mit sauber formatierter Versdarstellung.
- Suche: Im Header nach Begriffen suchen, Treffer anklicken, um direkt zum Kapitel zu springen.
- Mobilnutzung: Layout passt sich automatisch an kleinere Bildschirme an.

## Weitere Übersetzungen hinzufügen

1. Eine neue Zefania-XML-Datei in den Ordner `data/` kopieren (z. B. `Schlachter1951.xml`).
2. Container neu starten oder den Backend-Container neu laden:
   ```bash
   docker compose restart backend
   ```
3. Die neue Übersetzung erscheint automatisch in der Auswahl.

## Standardübersetzung festlegen

- Die App wählt standardmäßig die alphabetisch erste verfügbare Übersetzung.
- Um eine bestimmte Übersetzung als Standard zu setzen, benennen Sie die XML-Datei so um, dass sie alphabetisch zuerst einsortiert wird (z. B. `00_Luther1912.xml`).

## Architekturhinweise

- **Backend**: Der Provider-Layer (`providers/zefania.py`) lässt sich später um weitere Formate (JSON, OSIS) ergänzen.
- **Suche**: Aktuell einfacher In-Memory-Index; alternativ kann ein SQLite-Backend ergänzt werden.
- **Frontend**: Vite + React + Tailwind, modular aufgebaut für leichte Erweiterbarkeit.

## FAQ

**Kann die App komplett offline betrieben werden?**
Ja. Sämtliche Daten werden lokal aus den XML-Dateien gelesen. Es werden keine externen Dienste benötigt.

**Wie kann ich weitere Kapitel oder Bücher hinzufügen?**
Fügen Sie vollständige Zefania-XML-Dateien in `data/` hinzu. Beim nächsten Start werden diese automatisch eingelesen.

**Welche Lizenzen gelten für die Texte?**
Bitte verwenden Sie ausschließlich freie oder lizenzrechtlich erlaubte Bibeltexte.

**Wie aktualisiere ich die Anwendung?**
Pullen Sie neue Änderungen aus dem Repository und führen Sie `docker compose build --no-cache` gefolgt von `docker compose up -d` aus.

## Lizenz

Dieses Projekt stellt lediglich die technische Infrastruktur bereit. Bitte beachten Sie die Lizenzbedingungen der verwendeten Bibeltexte.
