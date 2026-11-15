# Phase 1 — Fondation de l'intégration

## Éléments livrés

- Domaine Home Assistant : `nba_center`.
- Ressource Lovelace : `/nba-center-ha/nba-center-card.js`.
- Élément personnalisé : `custom:nba-center-ha-card`.
- Enregistrement automatique de la ressource en mode Lovelace Storage.
- Instructions de configuration manuelle pour les installations en mode YAML.
- Bundle frontend précompilé dans le dépôt.

## Validation

- La ressource Lovelace est ajoutée automatiquement sur l'instance de test.
- La carte personnalisée se charge correctement.
- Le fonctionnement de l'intégration a été vérifié sur une instance Home Assistant réelle.

## Ressources en mode YAML

Pour les installations Lovelace en mode YAML, ajouter :

```yaml
lovelace:
  resources:
    - url: /nba-center-ha/nba-center-card.js
      type: module
```
