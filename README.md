# Ghost BunnyCDN Connector

## Overview

The **Ghost BunnyCDN Connector** is a custom plugin designed to integrate seamlessly with Ghost CMS. It automatically registers webhooks to purge BunnyCDN cache whenever content is updated, ensuring that changes are reflected immediately. The default cache Time-To-Live (TTL) for BunnyCDN is set to **one year**, and for browsers, it is set to **one hour**, for example.&#x20;

Ghost CMS actually sets `Cache-Control: public, max-age=0` by default for html (cache disabled), which we override in BunnyCDN to establish a long-lived frontend cache while ensuring updates are properly invalidated.

The Docker image for this service is available on **Docker Hub** as:

```
bauer-group/ghost-bunnycdn-connector:latest
```

## Features

- **Automated Webhook Registration**: The plugin automatically registers the necessary webhooks in Ghost CMS.
- **Instant Cache Purging**: Ensures that updates appear immediately on BunnyCDN by purging relevant pages.
- **Efficient Caching Strategy**: Maintains optimal caching while preventing outdated content from being served.
- **Dockerized Deployment**: Easily deployable as a containerized service.

## Webhook Registration

The following webhooks are automatically registered with Ghost CMS and mapped to the corresponding API endpoints:

- `post.published` → `/webhook/post-published`
- `post.published.edited` → `/webhook/post-published-edited`
- `post.unpublished` → `/webhook/post-unpublished`
- `page.published` → `/webhook/page-published`
- `page.published.edited` → `/webhook/page-published-edited`
- `page.unpublished` → `/webhook/page-unpublished`

Whenever these events occur, the plugin purges the **homepage** and the **affected page** from BunnyCDN to keep content fresh while maintaining a high cache hit ratio.


> **Note:** Webhooks are automatically registered when the container starts and unregistered when the container stops.

## Installation & Setup

### Prerequisites

- A running instance of **Ghost CMS**
- **BunnyCDN API Key**
- **Docker** & **Docker Compose**
- (Optional) **Cloudflare Tunnel** or **ngrok** for local testing

### Environment Variables

All required configuration parameters are stored in an environment file (`.env`). See `example.env` for reference.

Example `example.env` file:

```ini
# --------------------------------------------
# Example Environment Variables for Production
# --------------------------------------------
LOG_LEVEL=info

# Title: CDN Cache Invalidator
# Description: App running in Docker Container that Handles Interface for CDN

GHOST_URL=http://localhost:2368
GHOST_CDN_BASE_URL=https://public-site.com

GHOST_ADMIN_API_SECRET=some-secure-secret

GHOST_WEBHOOK_TARGET=http://localhost:3000
GHOST_WEBHOOK_SECRET=some-secure-webhook-secret

BUNNYCDN_API_KEY=your_api_key
```

### Deployment

The service is deployed via **Docker Hub**:

```sh
docker pull bauer-group/ghost-bunnycdn-connector:latest
```

Run the service manually with environment variables:

```sh
docker run -d --name ghost-bunnycdn-connector \
  -e GHOST_URL=http://localhost:2368 \
  -e GHOST_CDN_BASE_URL=https://public-site.com \
  -e GHOST_ADMIN_API_SECRET=some-secure-secret \
  -e GHOST_WEBHOOK_TARGET=http://localhost:3000 \
  -e GHOST_WEBHOOK_SECRET=some-secure-webhook-secret \
  -e BUNNYCDN_API_KEY=your_api_key \
  -p 3000:3000 \
  bauergroup/ghost-bunnycdn-connector:latest
```

Or use it directly in `docker-compose.yml`:

```yaml
version: '3'
services:
  ghost-bunnycdn-connector:
    image: bauergroup/ghost-bunnycdn-connector:latest
    restart: unless-stopped
    env_file: .env
    environment:
      - TZ=Etc/UTC
    expose:
      - 3000/tcp
    networks:    
      local:
```

## Automating BunnyCDN Pull Zone Creation

To quickly set up a new **BunnyCDN Pull Zone** via API, you can use the following anonymized API request:

```json
{  
  "Name": "your-custom-domain",
  "OriginUrl": "https://cms.your-custom-domain.com",
  "Enabled": true,
  "Suspended": false,
  "Hostnames": [
    {      
      "Value": "your-custom-domain.b-cdn.net",
      "ForceSSL": false,
      "IsSystemHostname": true,
      "HasCertificate": true,
      "Certificate": null,
      "CertificateKey": null
    },
    {
      "Value": "your-custom-domain.com",
      "ForceSSL": false,
      "IsSystemHostname": false,
      "HasCertificate": true,
      "Certificate": null,
      "CertificateKey": null
    },
    {
      "Value": "www.your-custom-domain.com",
      "ForceSSL": false,
      "IsSystemHostname": false,
      "HasCertificate": true,
      "Certificate": null,
      "CertificateKey": null
    }
  ],
  "StorageZoneId": 0,
  "EdgeScriptId": -1,
  "EdgeScriptExecutionPhase": 0,
  "MiddlewareScriptId": null,
  "MagicContainersAppId": null,
  "MagicContainersEndpointId": null,
  "AllowedReferrers": [],
  "BlockedReferrers": [],
  "BlockedIps": [],
  "EnableGeoZoneUS": true,
  "EnableGeoZoneEU": true,
  "EnableGeoZoneASIA": true,
  "EnableGeoZoneSA": true,
  "EnableGeoZoneAF": true,
  "ZoneSecurityEnabled": false,  
  "ZoneSecurityIncludeHashRemoteIP": false,
  "IgnoreQueryStrings": false,
  "MonthlyBandwidthLimit": 0,
  "MonthlyBandwidthUsed": 0,
  "MonthlyCharges": 0.0,
  "AddHostHeader": false,
  "OriginHostHeader": "",
  "Type": 0,
  "AccessControlOriginHeaderExtensions": [
    "eot",
    "ttf",
    "woff",
    "woff2",
    "css",
    "js",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "mp3",
    "mp4",
    "mpeg",
    "svg",
    "webm"
  ],
  "EnableAccessControlOriginHeader": true,
  "DisableCookies": false,
  "BudgetRedirectedCountries": [],
  "BlockedCountries": [],
  "EnableOriginShield": false,
  "CacheControlMaxAgeOverride": 31919000,
  "CacheControlPublicMaxAgeOverride": 3600,
  "BurstSize": 0,
  "RequestLimit": 0,
  "BlockRootPathAccess": false,
  "BlockPostRequests": false,
  "LimitRatePerSecond": 0,
  "LimitRateAfter": 0,
  "ConnectionLimitPerIPCount": 0,
  "PriceOverride": 0,
  "OptimizerPricing": 9.5,
  "AddCanonicalHeader": false,
  "EnableLogging": true,
  "EnableCacheSlice": false,
  "EnableSmartCache": false,
  "EdgeRules": [
    {      
      "ActionType": 15,
      "ActionParameter1": "",
      "ActionParameter2": "",
      "ActionParameter3": null,
      "Triggers": [
        {
          "Type": 1,
          "PatternMatches": [
            "*ghost-members-ssr*",
            "*ghost-admin-api-session*",
            "*ghost-private*"
          ],
          "PatternMatchingType": 0,
          "Parameter1": "Cookie"
        },
        {
          "Type": 0,
          "PatternMatches": [
            "*/content/*",
            "*/assets/*",
            "*/public/*"
          ],
          "PatternMatchingType": 2,
          "Parameter1": ""
        }
      ],
      "ExtraActions": [
        {
          "ActionType": 3,
          "ActionParameter1": "0",
          "ActionParameter2": "",
          "ActionParameter3": null
        }
      ],
      "TriggerMatchingType": 1,
      "Description": "Cache Bypass for Members",
      "Enabled": true,
      "OrderIndex": 0
    },
    {      
      "ActionType": 15,
      "ActionParameter1": "",
      "ActionParameter2": "",
      "ActionParameter3": null,
      "Triggers": [
        {
          "Type": 0,
          "PatternMatches": [
            "*/p/*",
            "*/ghost/*",
            "*/members/*",
            "*/r/*",
            "*/sitemap.xml"
          ],
          "PatternMatchingType": 0,
          "Parameter1": ""
        },
        {
          "Type": 9,
          "PatternMatches": [
            "POST"
          ],
          "PatternMatchingType": 0,
          "Parameter1": null
        }
      ],
      "ExtraActions": [
        {
          "ActionType": 3,
          "ActionParameter1": "0",
          "ActionParameter2": "",
          "ActionParameter3": null
        }
      ],
      "TriggerMatchingType": 0,
      "Description": "Cache Bypass for Admin Area",
      "Enabled": true,
      "OrderIndex": 0
    },
    {      
      "ActionType": 12,
      "ActionParameter1": "",
      "ActionParameter2": "",
      "ActionParameter3": null,
      "Triggers": [
        {
          "Type": 0,
          "PatternMatches": [
            "*/ghost*"
          ],
          "PatternMatchingType": 0,
          "Parameter1": ""
        }
      ],
      "ExtraActions": [],
      "TriggerMatchingType": 0,
      "Description": "Disable Optimizer for Backend",
      "Enabled": true,
      "OrderIndex": 0
    }
  ],
  "EnableWebPVary": false,
  "EnableAvifVary": false,
  "EnableCountryCodeVary": false,
  "EnableMobileVary": false,
  "EnableCookieVary": false,
  "CookieVaryParameters": [],
  "EnableHostnameVary": false,
  "CnameDomain": "b-cdn.net",
  "AWSSigningEnabled": false,
  "AWSSigningKey": null,
  "AWSSigningSecret": null,
  "AWSSigningRegionName": null,
  "LoggingIPAnonymizationEnabled": false,
  "EnableTLS1": false,
  "EnableTLS1_1": true,
  "VerifyOriginSSL": false,
  "ErrorPageEnableCustomCode": false,
  "ErrorPageCustomCode": null,
  "ErrorPageEnableStatuspageWidget": false,
  "ErrorPageStatuspageCode": null,
  "ErrorPageWhitelabel": true,
  "OriginShieldZoneCode": "FR",
  "LogForwardingEnabled": false,
  "LogForwardingHostname": null,
  "LogForwardingPort": 0,
  "LogForwardingToken": null,
  "LogForwardingProtocol": 0,
  "LoggingSaveToStorage": false,
  "LoggingStorageZoneId": 0,
  "FollowRedirects": false,
  "VideoLibraryId": -1,
  "DnsRecordId": 0,
  "DnsZoneId": 0,
  "DnsRecordValue": null,
  "OptimizerEnabled": false,
  "OptimizerTunnelEnabled": false,
  "OptimizerDesktopMaxWidth": 1600,
  "OptimizerMobileMaxWidth": 800,
  "OptimizerImageQuality": 85,
  "OptimizerMobileImageQuality": 70,
  "OptimizerEnableWebP": true,
  "OptimizerPrerenderHtml": false,
  "OptimizerEnableManipulationEngine": true,
  "OptimizerMinifyCSS": true,
  "OptimizerMinifyJavaScript": true,
  "OptimizerWatermarkEnabled": false,
  "OptimizerWatermarkUrl": "",
  "OptimizerWatermarkPosition": 0,
  "OptimizerWatermarkOffset": 3,
  "OptimizerWatermarkMinImageSize": 300,
  "OptimizerAutomaticOptimizationEnabled": true,
  "PermaCacheStorageZoneId": 0,
  "PermaCacheType": 0,
  "OriginRetries": 0,
  "OriginConnectTimeout": 10,
  "OriginResponseTimeout": 60,
  "UseStaleWhileUpdating": true,
  "UseStaleWhileOffline": true,
  "OriginRetry5XXResponses": false,
  "OriginRetryConnectionTimeout": true,
  "OriginRetryResponseTimeout": true,
  "OriginRetryDelay": 0,
  "QueryStringVaryParameters": [],
  "OriginShieldEnableConcurrencyLimit": false,
  "OriginShieldMaxConcurrentRequests": 200,
  "EnableSafeHop": false,
  "CacheErrorResponses": true,
  "OriginShieldQueueMaxWaitTime": 30,
  "OriginShieldMaxQueuedRequests": 5000,
  "OptimizerClasses": [],
  "OptimizerForceClasses": false,
  "OptimizerStaticHtmlEnabled": false,
  "OptimizerStaticHtmlWordPressPath": null,
  "OptimizerStaticHtmlWordPressBypassCookie": null,
  "UseBackgroundUpdate": true,
  "EnableAutoSSL": false,
  "EnableQueryStringOrdering": true,
  "LogAnonymizationType": 0,
  "LogFormat": 1,
  "LogForwardingFormat": 1,
  "ShieldDDosProtectionType": 1,
  "ShieldDDosProtectionEnabled": false,
  "OriginType": 0,
  "EnableRequestCoalescing": false,
  "RequestCoalescingTimeout": 30,
  "OriginLinkValue": "https://cms.your-custom-domain.com",
  "DisableLetsEncrypt": false,
  "EnableBunnyImageAi": false,
  "BunnyAiImageBlueprints": [
    {
      "Name": "demo-pixel-avatar",
      "Properties": {
        "PrePrompt": "cute pixel art of a",
        "PostPrompt": "with a colorful solid background"
      }
    },
    {
      "Name": "demo-cyberpunk-avatar",
      "Properties": {
        "PrePrompt": "cyberpunk avatar",
        "PostPrompt": "cyber tech with colorful background pastel colors, digital art"
      }
    }
  ],
  "PreloadingScreenEnabled": false,
  "PreloadingScreenShowOnFirstVisit": false,
  "PreloadingScreenCode": "",
  "PreloadingScreenLogoUrl": null,
  "PreloadingScreenCodeEnabled": false,
  "PreloadingScreenTheme": 0,
  "PreloadingScreenDelay": 1000,
  "EUUSDiscount": 0,
  "SouthAmericaDiscount": 0,
  "AfricaDiscount": 0,
  "AsiaOceaniaDiscount": 0,
  "RoutingFilters": [
    "all"
  ],
  "BlockNoneReferrer": true,
  "StickySessionType": 0,
  "StickySessionCookieName": null,
  "StickySessionClientHeaders": null,
  "OptimizerEnableUpscaling": false
}
```

This API call helps automate the setup of BunnyCDN’s caching rules and configurations in alignment with the plugin’s purging behavior.

## Usage

### Health Check

Verify if the service is running:

```sh
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "OK"
}
```

### Webhook Endpoint

Ghost will send update events to the following endpoints:

```
POST /webhook/post-published
POST /webhook/post-published-edited
POST /webhook/post-unpublished
POST /webhook/page-published
POST /webhook/page-published-edited
POST /webhook/page-unpublished
```

The connector automatically purges BunnyCDN cache when receiving webhook events.

## Developer Guide

### Local Testing

To test locally, use the following command:

```sh
docker-compose --env-file .env up --build
```

### Debugging

Enable verbose logging by setting:

```ini
LOG_LEVEL=debug
```

Then, check logs with:

```sh
docker logs -f ghost-bunnycdn-connector
```

To test locally, expose the service using **Cloudflare Tunnel** (recommended) or **ngrok**:

```sh
cloudflared tunnel --url http://localhost:3000
```

## License

This project is licensed under the **MIT License**.

## Support

For support or issues, please contact **[support@bauer-group.com](mailto\:support@bauer-group.com)**.

