# Architecture et conventions du projet

## Identité

- Nom officiel : **NBA Center HomeAssistant**
- Dépôt : `cy-bertrand/nba-center-ha`
- Domaine Home Assistant : `nba_center`
- Carte Lovelace : `custom:nba-center-ha-card`
- Version stable initiale : `1.0.0`
- Licence : MIT

## Architecture

Le projet est une intégration Home Assistant autonome :

- Backend Python pour les appels de données, le cache et les entités Home Assistant.
- Frontend JavaScript avec Lit et Web Components.
- Les données ESPN sont récupérées côté backend ; le frontend ne contacte pas directement ESPN.
- La ressource Lovelace est servie localement par l'intégration.
- En mode Lovelace Storage, l'intégration enregistre automatiquement la ressource de la carte.
- Le bundle frontend précompilé est fourni dans le dépôt : aucune compilation n'est nécessaire sur l'installation Home Assistant de l'utilisateur.

## Principes de développement

- Préserver la compatibilité des entités, services, événements et automatisations publiés.
- Centraliser les appels externes dans le backend et utiliser le cache pour limiter les requêtes.
- Respecter le fuseau horaire configuré dans Home Assistant.
- Maintenir les tests backend, frontend et les contrôles HACS/Hassfest.
- Documenter les changements incompatibles et les migrations avant toute release.
-  Pour la release au format tag x.y.z, bien penser à mettre à jour le numéro de release dans le manifest pour assurer le refresh du frontend.

## Build frontend

Les sources sont dans `frontend/src/`. Le script `build.mjs` génère le bundle distribué dans `custom_components/nba_center/www/`. Le bundle généré doit rester synchronisé avec les sources. Les scripts npm et le fichier de verrouillage servent au build et aux tests locaux/CI ; ils ne sont pas requis sur Home Assistant.

## Licence et contenus tiers

Le code original du projet est distribué sous licence MIT. Cette licence ne confère aucun droit sur les marques, logos, images, données ou services de la NBA, d'ESPN ou de Home Assistant. Les droits et conditions des tiers restent applicables.
