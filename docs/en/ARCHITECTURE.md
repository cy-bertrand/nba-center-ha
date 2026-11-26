# Architecture and project conventions

## Identity

- Official name: **NBA Center HomeAssistant**
- Repository: `cy-bertrand/nba-center-ha`
- Home Assistant domain: `nba_center`
- Lovelace card: `custom:nba-center-ha-card`
- Current release being prepared: `1.2.2`
- License: MIT

## Architecture

NBA Center is a standalone Home Assistant integration:

- Python backend handles data requests, caching and Home Assistant entities.
- JavaScript frontend uses Lit and Web Components.
- ESPN data is retrieved by the backend; the frontend never contacts ESPN directly.
- The Lovelace resource is served locally by the integration.
- In Lovelace Storage mode, the integration registers the card resource automatically.
- A prebuilt frontend bundle is included in the repository; users do not need to build it on their Home Assistant host.
- Match Center includes a Score Timeline (home score minus away score across regulation and overtime) and clickable game leaders that open player profiles.

## Development principles

- Preserve compatibility of published entities, services, events and automations.
- Centralize external requests in the backend and use caching to limit requests.
- Respect the timezone configured in Home Assistant.
- Never invent missing statistics or data.
- Make data retrieval and parsing reliable before adding frontend complexity.
- Maintain backend, frontend, HACS and Hassfest checks.
- Document breaking changes and migrations before releases.
- Before each `vX.Y.Z` release, update `version` in `manifest.json`; the frontend build injects it into the distributed bundle.

## Frontend build

Sources are in `frontend/src/`. The `build.mjs` script generates the distributed bundle in `custom_components/nba_center/www/`. The committed bundle must remain synchronized with its sources. npm scripts and the lockfile are used for local development and CI; they are not required on Home Assistant.

## License and third-party content

Original project code is distributed under the MIT License. This license does not grant rights to NBA, ESPN or Home Assistant trademarks, logos, images, data or services. Third-party rights and terms remain applicable.
