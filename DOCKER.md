# 📄 Dokumentation: Ghost BunnyCDN Connector&#x20;

## 🐳 Docker Compose

Zum Starten der Umgebung mit `docker-compose` 🏗️:

```bash
docker compose --env-file .env up --build
```

---

## 💻 Entwicklung

### 🔧 Build-Prozess

#### 🏗️ Vollständiger Build

```bash
docker build . --no-cache -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
```

#### 🔄 Inkrementeller Build

```bash
docker build . -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
```

### ▶️ Ausführen / Starten

#### 🖥️ Interaktive Bash-Shell

```bash
docker run --rm -i -t bauergroup/ghost-bunnycdn-connector:latest /bin/bash
```

#### 🔄 Inkrementeller Build mit interaktivem Start

```bash
docker build . -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest && docker run --rm -i -t bauergroup/ghost-bunnycdn-connector:latest /bin/bash
```

---

## 🚀 Deployment

### ✅ Voraussetzungen

#### 🏗️ Multi-Plattform-Umgebung für ARM-Target auf AMD64 erstellen

##### 🔧 Umgebung erstellen und aktivieren

```bash
docker buildx create --name multiplattform --bootstrap --use --platform linux/amd64,linux/386,linux/arm64,linux/arm
```

##### 🔍 Umgebung überprüfen

```bash
docker buildx inspect multiplattform
```

##### ♻️ Bestehende Umgebung nutzen

```bash
docker buildx use multiplattform
```

##### 🗑️ Umgebung entfernen

```bash
docker buildx rm multiplattform
```

### 🏗️ Build-Prozess

#### 📦 Build für alle Plattformen (ohne Push)

```bash
docker buildx build --platform linux/amd64,linux/arm64 . --no-cache -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
```

#### 🏠 Erstelltes Image in den lokalen Docker-Server laden

```bash
docker buildx build --load -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest .
```

#### 🚀 Build & Push zum Registry

```bash
docker buildx build --push --platform linux/amd64,linux/arm64 . --no-cache -t bauergroup/ghost-bunnycdn-connector:0.1 -t bauergroup/ghost-bunnycdn-connector:latest
```

---

## 📜 Erweiterter Build mit Metadaten 🏷️

Für eine erweiterte Build-Konfiguration mit Metadaten (z. B. Git-Revision und Erstellungsdatum 📅) kann folgender Befehl verwendet werden:

```bash
docker build --label org.opencontainers.image.revision=$(git rev-parse HEAD) \
             --label org.opencontainers.image.ref.name=$(git rev-parse --abbrev-ref HEAD) \
             --label org.opencontainers.image.created=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
             -t bauergroup/ghost-bunnycdn-connector:0.1 \
             -t bauergroup/ghost-bunnycdn-connector:latest .
```

