# Cursor KI-Agent MCP-Server

Dieser MCP-Server (Model Context Protocol) ermöglicht die Steuerung des KI-Agenten in Cursor über eine mobile Benutzeroberfläche. Mit diesem Server können Sie Befehle von einem Mobilgerät an den Cursor-KI-Chat senden und Antworten empfangen.

## Funktionen

- 🌐 **MCP-Server**: Empfängt Befehle von mobilen Geräten und kommuniziert mit dem Cursor-Plugin
- 🔌 **Cursor-Plugin**: Verbindet sich mit dem MCP-Server und führt Befehle im Cursor-KI-Chat aus
- 📱 **Web-UI**: Einfache Benutzeroberfläche für die Interaktion mit dem Cursor-KI-Agenten
- 🔄 **Echtzeit-Kommunikation**: Streaming von Antworten über WebSockets/SSE
- 🔒 **Sicherheit**: Optional aktivierbare Authentifizierung und Autorisierung
- 🐳 **Docker-Unterstützung**: Einfache Bereitstellung mit Docker

## Systemanforderungen

- Node.js 14.x oder höher
- Cursor-IDE (mit KI-Funktionalität)

## Voraussetzungen installieren

### Node.js installieren

#### macOS
1. Mit Homebrew (empfohlen):
```bash
# Homebrew installieren, falls nicht vorhanden
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Node.js installieren
brew install node
```

2. Alternativ: Lade den Installer von [nodejs.org](https://nodejs.org/) herunter.

#### Windows
1. Lade den Installer von [nodejs.org](https://nodejs.org/) herunter.
2. Folge den Anweisungen des Installers.

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Installation

1. Klone dieses Repository:
```bash
git clone https://github.com/yourusername/cursor-mcp-server.git
cd cursor-mcp-server
```

2. Installiere die Abhängigkeiten:
```bash
npm install
```

3. Erstelle eine `.env`-Datei aus der Vorlage:
```bash
cp .env.example .env
```

4. Starte den MCP-Server:
```bash
npm start
```

5. Installiere das Cursor-Plugin:
   - Automatisch mit unserem Skript:
     ```bash
     ./install-plugin.sh
     ```
   - Oder manuell:
     - Kopiere die Datei `src/plugin/cursor-plugin.js` in das Cursor-Plugin-Verzeichnis:
       - macOS: `~/.cursor/plugins/cursor-mcp-plugin/index.js`
       - Windows: `%APPDATA%\Cursor\plugins\cursor-mcp-plugin\index.js`
     - Stelle sicher, dass das Verzeichnis `cursor-mcp-plugin` existiert oder erstelle es.

6. Konfiguriere das Cursor-Plugin:
   - Kopiere die Datei `.cursorrc` in dein Benutzerverzeichnis:
     - macOS/Linux: `~/.cursorrc`
     - Windows: `%USERPROFILE%\.cursorrc`

7. Starte Cursor neu, um die Plugin-Änderungen zu laden.

## Installation mit einem Befehl

Du kannst den MCP-Server und das Plugin mit einem einzigen Befehl installieren:

```bash
npx cursor-mcp-installer@latest --config='{"serverUrl":"http://localhost:3000"}'
```

Alternativ kannst du auch das Repository direkt verwenden:

```bash
npx -y https://github.com/yourusername/cursor-mcp-server.git/setup-mcp.js --config='{"serverUrl":"http://localhost:3000"}'
```

Diese Befehle erledigen automatisch:
- Herunterladen des MCP-Codes
- Installation des Cursor-Plugins
- Einrichtung des MCP-Servers
- Erstellung der notwendigen Konfigurationsdateien

Nach der Installation musst du Cursor neu starten und dann den MCP-Server mit `npm start` im installierten Verzeichnis starten.

## Docker-Installation

Alternativ kannst du den MCP-Server mit Docker ausführen:

```bash
# Server-Image bauen
npm run docker:build

# Server starten
npm run docker:run
```

Oder mit docker-compose:

```bash
docker-compose up -d
```

## Authentifizierung konfigurieren

Standardmäßig ist die Authentifizierung deaktiviert. Um sie zu aktivieren:

1. Öffne die `.env`-Datei
2. Setze `AUTH_ENABLED=true`
3. Ändere `ADMIN_USERNAME` und `ADMIN_PASSWORD` nach Bedarf
4. Ändere `JWT_SECRET` zu einem sicheren Wert

## Verwendung

1. Starte den MCP-Server:
```bash
npm start
```

2. Öffne einen Webbrowser und navigiere zu `http://localhost:3000`

3. Falls Authentifizierung aktiviert ist, melde dich mit deinen Zugangsdaten an

4. Gib einen Prompt ein und klicke auf "Senden"

5. Die Antwort vom Cursor-KI-Agenten wird in der Benutzeroberfläche angezeigt

## Tests ausführen

Die Testsuite mit Jest ausführen:

```bash
npm test
```

## Integration mit dem Model Context Protocol

Der Server implementiert das Model Context Protocol (MCP) und stellt zwei Tools bereit:

- `cursor_chat`: Führt Befehle im Cursor-KI-Chat aus
- `get_chat_history`: Ruft den Chat-Verlauf aus dem Cursor-KI-Chat ab

Die MCP-Manifestdatei (`mcp-manifest.yaml`) definiert diese Tools und ihre Endpunkte.

## Architektur

```
+---------------+         +---------------+         +---------------+
|               |         |               |         |               |
|  Mobile UI    |<------->|   MCP-Server  |<------->| Cursor-Plugin |
|  (Browser)    |   HTTP  |   (Node.js)   |    WS   |               |
|               |   SSE   |               |         |               |
+---------------+         +---------------+         +---------------+
                                                           |
                                                           | API
                                                           v
                                                    +---------------+
                                                    |               |
                                                    | Cursor KI-Chat|
                                                    |               |
                                                    +---------------+
```

## API-Endpunkte

| Endpunkt           | Methode | Beschreibung                               | Authentifizierung |
|--------------------|---------|-------------------------------------------|-------------------|
| `/execute`         | POST    | Führt einen Prompt im Cursor-KI-Chat aus   | Optional          |
| `/history`         | GET     | Ruft den Chat-Verlauf ab                   | Optional          |
| `/api/login`       | POST    | Authentifiziert einen Benutzer             | Nein              |
| `/api/auth-status` | GET     | Prüft, ob Authentifizierung aktiviert ist  | Nein              |

## Erweiterungen und Anpassungen

Du kannst diesen MCP-Server nach deinen Bedürfnissen anpassen:

- **Authentifizierung**: Anpassung der Authentifizierungsmethoden (OAuth, SAML, etc.)
- **Erweiterte Funktionen**: Implementiere zusätzliche Tools für den Cursor-KI-Agenten
- **Mobile App**: Entwickle eine dedizierte mobile App anstelle der Web-UI

## Fehlerbehebung

- **Verbindungsprobleme**: Stelle sicher, dass der MCP-Server auf Port 3000 läuft und von deinem Gerät erreichbar ist.
- **Plugin-Fehler**: Überprüfe die Cursor-Konsole auf Fehlermeldungen (⌘+Shift+I oder Ctrl+Shift+I).
- **Server-Fehler**: Überprüfe die Serverausgabe im Terminal auf Fehlermeldungen.
- **Authentifizierungsprobleme**: Überprüfe die .env-Datei und stelle sicher, dass die Authentifizierungseinstellungen korrekt sind.

## Bekannte Einschränkungen

- Das Cursor-Plugin hat möglicherweise eingeschränkten Zugriff auf den Cursor-KI-Chat, abhängig von der Cursor-API.
- Die Kommunikation mit dem Cursor-KI-Chat könnte durch Cursor-Updates unterbrochen werden.

## Beitrag

Beiträge sind willkommen! Bitte öffne ein Issue oder einen Pull Request für Verbesserungen oder Fehlerbehebungen.

## Lizenz

MIT 