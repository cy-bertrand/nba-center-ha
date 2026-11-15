# Base technique du projet

## Identité

- Nom officiel : **NBA Center HomeAssistant**
- Dépôt : `cy-bertrand/nba-center-ha`
- Domaine Home Assistant : `nba_center`
- Carte Lovelace : `custom:nba-center-ha-card`
- Version stable initiale visée : `1.0.0`
- Licence : MIT

## Architecture

Le projet est une intégration Home Assistant autonome :

- Backend Python pour les appels de données, le cache et les entités Home Assistant.
- Frontend JavaScript avec Lit et Web Components.
- Données de basket récupérées côté backend ; le frontend ne contacte pas directement les services de données externes.
- Ressource Lovelace servie localement par l'intégration.
- Enregistrement automatique de la ressource en mode Lovelace Storage.
- Bundle frontend précompilé fourni dans le dépôt pour éviter toute compilation sur l'installation de l'utilisateur.

## Principes de développement

- Préserver la compatibilité des entités, services, événements et automatisations publiés.
- Centraliser les appels externes dans le backend et utiliser le cache.
- Respecter le fuseau horaire Home Assistant.
- Ne jamais inventer de statistiques ou de données manquantes.
- Maintenir les tests backend, frontend et les contrôles HACS/Hassfest.
- Documenter les changements incompatibles et les migrations avant toute release.

## Licence et contenus tiers

Le code original du projet est distribué sous licence MIT. Cette licence ne confère aucun droit sur les marques, logos, images, données ou services de la NBA, d'ESPN ou de Home Assistant. Les droits de tiers restent applicables.
