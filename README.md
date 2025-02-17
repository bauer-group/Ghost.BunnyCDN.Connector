# Ghost BunnyCDN Connector

## Übersicht

Die Anwendung `@bauer-group/ghost-bunnycdn-connector` ist ein Node.js-Dienst, der Webhooks registriert und verarbeitet. Die Anwendung ist vollständig in TypeScript geschrieben und läuft in einem Docker-Container.

## Voraussetzungen

- Node.js (Version 14 oder höher)
- Docker
- Docker Compose

## Installation

1. Klone das Repository:

   git clone https://github.com/bauer-group/ghost-bunnycdn-connector.git

2. Navigiere in das Projektverzeichnis:

   cd ghost-bunnycdn-connector

3. Installiere die Abhängigkeiten:

   npm install

## Docker

Um die Anwendung in einem Docker-Container auszuführen, kannst du die folgenden Schritte befolgen:

1. Baue das Docker-Image:

   docker build -t ghost-bunnycdn-connector .

2. Starte die Anwendung mit Docker Compose:

   docker-compose up

## Nutzung

Die Anwendung registriert Webhooks beim Start und verarbeitet eingehende Webhook-Anfragen über den `WebhookController`. Du kannst die Webhooks an die definierte URL senden, um die Verarbeitung zu testen.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen findest du in der LICENSE-Datei.