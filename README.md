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

-------

docker compose --env-file .env up --build

Development
-----------
 Build:
  Full Build:
   docker build . --no-cache -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
  Incremential Build:
   docker build . -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
 Execute / Run:
  Interactive - Bash Shell:
   docker run --rm -i -t bauergroup/ghost-bunnycdn-connector:latest /bin/bash
  Incremental Build with Interactive Execute:
   docker build . -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest && docker run --rm -i -t bauergroup/ghost-bunnycdn-connector:latest /bin/bash

Deployment:
-----------
 Prerequesities:
  Create Multiplattform Environment to Build for ARM Target on AMD64:
   Create and Activate Environment:
    docker buildx create --name multiplattform --bootstrap --use --platform linux/amd64,linux/386,linux/arm64,linux/arm
   Check Environment:
    docker buildx inspect multiplattform
   Use Existing Environment:
    docker buildx use multiplattform
   Remove Environment:
    docker buildx rm multiplattform

 Build:
  Build ONLY for all Plattforms:
   docker buildx build --platform linux/amd64,linux/arm64,linux/386,linux/arm . --no-cache -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
  Load created Image into local Docker Server:
   docker buildx build --load -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest .
  Build & Push to Registry:
   docker buildx build --push --platform linux/amd64,linux/arm64,linux/386,linux/arm . --no-cache -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
