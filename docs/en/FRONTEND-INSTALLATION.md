# Lovelace card installation

## Requirements

- A Home Assistant version compatible with the integration.
- **NBA Center HomeAssistant** installed and configured.

## Automatic resource registration

In Lovelace **Storage** mode, the integration registers the frontend resource automatically. No manual resource declaration is required.

The resource is served at:

```text
/nba-center-ha/nba-center-card.js
```

If it does not appear after installation or an update, restart Home Assistant and check **Settings → Dashboards → Resources**. Do not add a duplicate resource if it is already registered.

## YAML mode

For Lovelace YAML mode, add the resource:

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /nba-center-ha/nba-center-card.js
      type: module
```

## Card

Add a manual card with this minimal configuration:

```yaml
type: custom:nba-center-ha-card
```

The card also supports title options and custom entity IDs. Default entities are discovered from integration data; if you have renamed entities, use the corresponding card options.

## Frontend architecture

- The frontend is distributed as a prebuilt JavaScript bundle.
- Node.js and compilation are not required on Home Assistant.
- ESPN requests are handled by the Python backend; the browser does not contact ESPN directly.

To contribute to the frontend, source code is in `frontend/src/nba-center-card.js`. Development commands are documented in the repository.
