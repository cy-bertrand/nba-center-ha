# Traductions / Translations

NBA Center uses two localization layers:

- **Home Assistant config flow**: `custom_components/nba_center/strings.json` is the French source; locale overrides live in `custom_components/nba_center/translations/<language>.json`.
- **Lovelace card**: `frontend/src/translations.js` contains the French source labels (the keys) and locale dictionaries. The card reads the Home Assistant UI language from `hass.locale.language` (falling back to `hass.language`). French is the fallback when a language or key is not translated.

## Add a frontend translation

1. Keep the French wording as the key in `frontend/src/translations.js`.
2. Add its English value to the `EN` dictionary.
3. In `frontend/src/nba-center-card.js`, render the label with `this._t("Texte français")`.
4. Add the corresponding translated label to every supported locale dictionary.
5. Run `npm test` after `npm run build`.

Do not translate ESPN payload values, team/player names, entity IDs, unique IDs, websocket command names, service names, or event names. They are data or stable integration identifiers, not UI labels.

## Ajouter une traduction Home Assistant

1. Modifier les libellés source dans `strings.json`.
2. Ajouter les mêmes clés dans `translations/<lang>.json` pour chaque langue prise en charge.
3. Conserver les clés techniques (`teams`, `notify_start`, etc.) identiques entre les fichiers.

## Current scope

The Lovelace card uses the Home Assistant UI locale through `this._t(...)`. All user-facing labels, accessibility text, placeholders, empty/error states, dates and statistic names should be localized rather than embedded directly in templates. French remains the fallback. The frontend localization is being expanded incrementally; stable entity IDs, ESPN values, player/team names and websocket contracts must remain unchanged.
