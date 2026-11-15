# Feuille de route — NBA Center HomeAssistant

| Phase | Sujet | État |
|---|---|---|
| 0 | Architecture et audit technique | Validée |
| 1 | Fondation de l'intégration et ressource Lovelace | Validée |
| 2 | Match Center | Fonctionnel ; validations continues |
| 3 | Détails des matchs et boxscores | En cours d'amélioration |
| 4 | Teams Center | À développer |
| 5 | Players Center | À développer |
| 6 | Stats Center | À développer |
| 7 | Robustesse, tests, HACS et documentation | HACS Action, Hassfest et build frontend validés ; préparation de la release 1.0.0 |

## Principes permanents

- Les appels ESPN restent centralisés dans le backend Python.
- Le frontend ne contacte jamais directement ESPN.
- Le cache limite les requêtes externes.
- Les fuseaux horaires Home Assistant sont respectés.
- Les statistiques absentes ne sont jamais inventées.
- La fiabilité des données prime sur l'ajout de nouvelles fonctions visuelles.
