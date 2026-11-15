# Installation de la carte Lovelace

## Prérequis

- Home Assistant compatible avec la version de l'intégration.
- Intégration **NBA Center HomeAssistant** installée et configurée.

## Enregistrement automatique

En mode Lovelace **Storage**, l'intégration enregistre automatiquement la ressource frontend. Aucune déclaration manuelle n'est nécessaire.

La ressource est servie à l'adresse :

```text
/nba-center-ha/nba-center-card.js
```

Si elle n'apparaît pas après l'installation ou une mise à jour, redémarre Home Assistant et vérifie **Paramètres → Tableaux de bord → Ressources**. Évite de déclarer une seconde fois une ressource déjà enregistrée.

## Installation en mode YAML

Pour une configuration Lovelace en mode YAML, ajoute la ressource :

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /nba-center-ha/nba-center-card.js
      type: module
```

## Carte

Ajoute une carte manuelle avec cette configuration minimale :

```yaml
type: custom:nba-center-ha-card
```

La carte peut aussi accepter des options de titre et des identifiants d'entités personnalisés. Les entités par défaut sont découvertes à partir des données de l'intégration ; si tu as renommé des entités, utilise les options correspondantes dans la configuration de la carte.

## Architecture frontend

- Le frontend est un bundle JavaScript précompilé fourni dans le dépôt.
- Aucune installation de Node.js ni compilation n'est nécessaire sur Home Assistant.
- Les appels ESPN sont effectués par le backend Python ; le navigateur ne contacte pas directement ESPN.

Pour contribuer au frontend, le code source se trouve dans `frontend/src/nba-center-card.js`. Les commandes de développement sont documentées dans le dépôt.
