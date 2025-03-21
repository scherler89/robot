#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const readline = require('readline');

// CLI-Argumente parsen
const args = process.argv.slice(2);
const configArg = args.find(arg => arg.startsWith('--config='));
const config = configArg ? JSON.parse(configArg.split('=')[1]) : {};

// Definiere Pfade basierend auf dem Betriebssystem
let pluginDir;
let configFile;
let serverDir;

if (process.platform === 'darwin') {
  // macOS
  pluginDir = path.join(os.homedir(), '.cursor', 'plugins', 'cursor-mcp-plugin');
  configFile = path.join(os.homedir(), '.cursorrc');
  serverDir = path.join(os.homedir(), '.cursor', 'mcp-server');
} else if (process.platform === 'win32') {
  // Windows
  pluginDir = path.join(process.env.APPDATA, 'Cursor', 'plugins', 'cursor-mcp-plugin');
  configFile = path.join(process.env.USERPROFILE, '.cursorrc');
  serverDir = path.join(process.env.APPDATA, 'Cursor', 'mcp-server');
} else {
  // Linux
  pluginDir = path.join(os.homedir(), '.cursor', 'plugins', 'cursor-mcp-plugin');
  configFile = path.join(os.homedir(), '.cursorrc');
  serverDir = path.join(os.homedir(), '.cursor', 'mcp-server');
}

// Funktion zum Erstellen eines Verzeichnisses, wenn es nicht existiert
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Verzeichnis erstellt: ${dir}`);
  }
}

// Funktion zum Kopieren von Dateien oder Verzeichnissen
function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    ensureDirectoryExists(dest);
    fs.readdirSync(src).forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      copyRecursive(srcFile, destFile);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// MCP-Repository klonen
function cloneRepository() {
  const tempDir = path.join(os.tmpdir(), 'cursor-mcp-temp');
  
  console.log('🔄 Lade MCP-Server-Code herunter...');
  
  // Lösche vorhandenes temporäres Verzeichnis, falls es existiert
  if (fs.existsSync(tempDir)) {
    execSync(`rm -rf "${tempDir}"`);
  }
  
  try {
    execSync(`git clone https://github.com/yourusername/cursor-mcp-server.git "${tempDir}"`, { stdio: 'inherit' });
    return tempDir;
  } catch (error) {
    console.error('❌ Fehler beim Herunterladen des Repositories:', error.message);
    process.exit(1);
  }
}

// Plugin und Server installieren
function installMCP(repoDir) {
  console.log('🔧 Installiere MCP-Plugin und Server...');
  
  // Erstelle Verzeichnisse
  ensureDirectoryExists(pluginDir);
  ensureDirectoryExists(serverDir);
  
  // Kopiere Plugin
  const pluginSrc = path.join(repoDir, 'src', 'plugin', 'cursor-plugin.js');
  const pluginDest = path.join(pluginDir, 'index.js');
  fs.copyFileSync(pluginSrc, pluginDest);
  console.log(`✅ Plugin installiert in: ${pluginDest}`);
  
  // Kopiere Server-Dateien
  copyRecursive(path.join(repoDir, 'src', 'server'), path.join(serverDir, 'server'));
  copyRecursive(path.join(repoDir, 'src', 'ui'), path.join(serverDir, 'ui'));
  fs.copyFileSync(path.join(repoDir, 'package.json'), path.join(serverDir, 'package.json'));
  
  // Kopiere .env
  const envExample = path.join(repoDir, '.env.example');
  const envDest = path.join(serverDir, '.env');
  fs.copyFileSync(envExample, envDest);
  
  // Erstelle oder aktualisiere .cursorrc
  const cursorrcContent = {
    "plugins": {
      "cursor-mcp-plugin": {
        "enabled": true,
        "serverUrl": config.serverUrl || "http://localhost:3000"
      }
    }
  };
  
  fs.writeFileSync(configFile, JSON.stringify(cursorrcContent, null, 2));
  console.log(`✅ Konfigurationsdatei erstellt: ${configFile}`);
  
  // Server-Abhängigkeiten installieren
  console.log('📦 Installiere Server-Abhängigkeiten...');
  process.chdir(serverDir);
  execSync('npm install --production', { stdio: 'inherit' });
  
  return serverDir;
}

// Hauptfunktion
async function main() {
  console.log('🚀 Cursor MCP-Server Einrichtung gestartet');
  
  const repoDir = cloneRepository();
  const serverPath = installMCP(repoDir);
  
  // Lösche temporäres Verzeichnis
  execSync(`rm -rf "${repoDir}"`);
  
  console.log('\n✨ Installation abgeschlossen!');
  console.log(`\nUm den MCP-Server zu starten:
  cd "${serverPath}"
  npm start
  
Bitte starten Sie Cursor neu, um die Änderungen zu übernehmen.`);
}

// Starte Hauptfunktion
main().catch(error => {
  console.error('❌ Fehler bei der Installation:', error);
  process.exit(1);
}); 