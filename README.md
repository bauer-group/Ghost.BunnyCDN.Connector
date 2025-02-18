# Ghost BunnyCDN Connector

## Overview

The `@bauer-group/ghost-bunnycdn-connector` is a Node.js service that registers and processes webhooks to automatically invalidate the cache of BunnyCDN. The application is fully written in TypeScript and runs in a Docker container.

## Prerequisites

- Node.js (version 20 or higher)
- Docker
- Docker Compose

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bauer-group/ghost-bunnycdn-connector.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ghost-bunnycdn-connector
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Docker

To run the application in a Docker container, follow these steps:

1. Build the Docker image:

   ```bash
   docker build -t ghost-bunnycdn-connector .
   ```

2. Start the application with Docker Compose:

   ```bash
   docker-compose up
   ```

## Usage


### Health Check

To check the health of the service, send a GET request to the following endpoint:

```
GET /health
```

This will return a JSON response with the status:

```json
{
  "Status": "OK"
}
```

## Configuration

The application can be configured via environment variables. Here are the most important variables:

- `GHOST_URL`: The URL of your Ghost CMS
- `GHOST_CDN_BASE_URL`: The base URL of your public website
- `GHOST_ADMIN_API_SECRET`: The Admin API Secret of your Ghost CMS
- `GHOST_WEBHOOK_TARGET`: The URL to which webhooks are sent
- `GHOST_WEBHOOK_SECRET`: The secret for webhook authentication
- `BUNNYCDN_API_KEY`: Your API key for BunnyCDN

Example of a `.env` file:

```plaintext
GHOST_URL=http://localhost:2368
GHOST_CDN_BASE_URL=https://public-site.com
GHOST_ADMIN_API_SECRET=some-secure-secret
GHOST_WEBHOOK_TARGET=http://localhost:3000
GHOST_WEBHOOK_SECRET=some-secure-webhook-secret
BUNNYCDN_API_KEY=your_api_key
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
