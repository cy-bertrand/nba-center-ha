# Phase 0 — Audit de l'architecture

## Objectif

Établir une base technique fiable pour NBA Center HomeAssistant avant l'ajout de fonctionnalités importantes.

## Architecture retenue

- Intégration Home Assistant Python.
- Frontend Lovelace en JavaScript, Lit et Web Components.
- Source de données ESPN sans clé API.
- Appels externes centralisés dans le backend.
- Cache pour limiter les requêtes.
- Entités et services Home Assistant comme interface stable avec les automatisations.
- Carte Lovelace autonome, servie localement par l'intégration.

## Règles de conception

1. Ne pas appeler ESPN directement depuis le frontend.
2. Ne pas réécrire inutilement les fonctions Python déjà fiables.
3. Préserver les identifiants et contrats publics des entités, services et événements.
4. Respecter les fuseaux horaires Home Assistant.
5. Ne pas inventer de données absentes de la source.
6. Fiabiliser l'alimentation des données avant d'ajouter de la complexité à l'interface.
7. Utiliser des tests automatisés et des validations sur une instance Home Assistant réelle.

## État

La base d'architecture est définie. Les contrôles HACS Action, Hassfest et le build frontend sont opérationnels. Les phases suivantes portent sur la fiabilité des données, l'expérience Lovelace et la préparation des releases.
