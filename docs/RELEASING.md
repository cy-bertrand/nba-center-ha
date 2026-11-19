# Publication et versionnement / Release and versioning

## Français

À chaque demande de création d'une nouvelle release NBA Center, suivre systématiquement cette procédure. **Ne jamais publier une release sans avoir d'abord mis à jour `custom_components/nba_center/manifest.json`.**

1. Vérifier la dernière release publiée et choisir le numéro suivant selon le versionnement sémantique (MAJOR.MINOR.PATCH).
2. Mettre à jour le champ `version` dans `custom_components/nba_center/manifest.json`.
3. Ne pas modifier manuellement le numéro de build du frontend : `build.mjs` lit la version du manifeste et l'injecte automatiquement dans le bundle. Le pied de page de la carte affiche donc la même version que l'intégration.
4. Lancer les validations Home Assistant/HACS et le build frontend. Vérifier que les tests passent et que le bundle `custom_components/nba_center/www/nba-center-card.js` est à jour.
5. Publier une GitHub Release avec un tag `vX.Y.Z` identique à la valeur `version` du manifeste.
6. Vérifier que la release et le manifeste affichent exactement le même numéro.
7. Si la release accompagne une soumission HACS en attente de corrections, mettre à jour la PR existante et la repasser en « Ready for review » lorsque toutes les conditions demandées par le mainteneur sont remplies. Ne pas ouvrir une seconde PR.

### Règle de cohérence

Les trois versions doivent toujours être identiques :

- `custom_components/nba_center/manifest.json` → `version`
- Tag GitHub → `vX.Y.Z`
- Version affichée dans le pied de page de la carte → `X.Y.Z`

Le numéro du frontend est généré au build depuis le manifeste : aucune mise à jour manuelle du code source n'est nécessaire.

## English

Whenever a new NBA Center release is requested, follow this procedure. **Never publish a release before updating `custom_components/nba_center/manifest.json`.**

1. Check the latest published release and select the next version using semantic versioning (MAJOR.MINOR.PATCH).
2. Update the `version` field in `custom_components/nba_center/manifest.json`.
3. Do not manually edit the frontend build version. `build.mjs` reads the manifest version and injects it into the bundle, so the card footer always displays the same version as the integration.
4. Run Home Assistant/HACS validation and the frontend build. Ensure tests pass and `custom_components/nba_center/www/nba-center-card.js` is up to date.
5. Publish a GitHub Release with a `vX.Y.Z` tag matching the manifest's `version` value.
6. Verify that the release and manifest show exactly the same version.
7. If the release addresses requested changes on a pending HACS submission, update the existing PR and mark it as « Ready for review » when all maintainer requirements are met. Do not open a duplicate PR.

### Consistency rule

These three versions must always match:

- `custom_components/nba_center/manifest.json` → `version`
- GitHub tag → `vX.Y.Z`
- Version displayed in the card footer → `X.Y.Z`

The frontend version is generated at build time from the manifest; no manual source-code update is required.
