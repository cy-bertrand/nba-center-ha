# Plan de tests — NBA Center HomeAssistant

## Principes

- Tester le backend Python et le frontend JavaScript séparément.
- Vérifier les contrats publics des entités, services, événements et automatisations.
- Vérifier le rendu de la carte Lovelace sur une instance Home Assistant réelle.
- Ne jamais considérer une réussite CI comme un substitut aux tests fonctionnels en conditions réelles.

## Tests automatisés

- Compilation Python.
- Tests unitaires et tests de parsing.
- Vérification syntaxique JavaScript.
- Build du bundle frontend.
- Validation HACS Action.
- Validation Hassfest.

## Tests fonctionnels Home Assistant

- Configuration et chargement de l'intégration.
- Création et mise à jour des capteurs.
- Fonctionnement du service `nba_center.get_game_details`.
- Émission des événements de début et de fin de match.
- Installation et fonctionnement du blueprint de notification.
- Enregistrement automatique de la ressource Lovelace en mode Storage.
- Chargement des vues et interaction avec la carte.
- Vérification des fuseaux horaires et des changements de date.
- Vérification des erreurs réseau, des réponses ESPN incomplètes et du cache.
