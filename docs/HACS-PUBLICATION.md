# Préparation de publication HACS

Ce document est une checklist de publication. Les résultats de CI mentionnés dans d'anciens commits ne doivent pas être considérés comme une validation du commit courant.

## État de référence antérieur

Une campagne de validation antérieure a été consignée sur le commit `bca7f56aa42a3b33c3ce3f98d36856335be0cb55` :

- HACS Action : 10 contrôles sur 10 réussis.
- Hassfest : réussi.
- Build frontend et tests Python/JavaScript : réussis.
- Licence MIT détectée par HACS.
- Icône locale présente dans `custom_components/nba_center/brand/icon.png`.

Ces résultats sont historiques. Ils doivent être revérifiés sur le commit destiné à la publication.

## Vérifications manuelles déjà réalisées

- Le dépôt a été ajouté comme dépôt personnalisé HACS de type Integration.
- L'intégration a enregistré automatiquement la ressource Lovelace en mode Storage.
- La carte `custom:nba-center-ha-card` s'est chargée sur l'instance Home Assistant de test.
- L'installation et le fonctionnement ont été vérifiés sur une instance Home Assistant réelle.

Refaire une vérification ciblée après toute modification de l'installation, du chargement de la ressource ou du bundle frontend.

## Checklist avant la première release

- [ ] Vérifier que la version de `custom_components/nba_center/manifest.json` est bien celle prévue pour la release.
- [ ] Exécuter les tests Python.
- [ ] Exécuter les tests JavaScript et reconstruire le bundle frontend.
- [ ] Vérifier que le bundle commité correspond aux sources frontend.
- [ ] Obtenir une réussite HACS Action sur le commit de publication.
- [ ] Obtenir une réussite Hassfest sur le commit de publication.
- [ ] Vérifier l'installation HACS et le chargement de la carte sur une instance Home Assistant.
- [ ] Vérifier les notes de version et les éventuelles migrations.
- [ ] Créer la release GitHub `v1.0.0` avec les notes de version.
- [ ] Préparer la soumission à `hacs/default`, dans la catégorie `integration`, en suivant les consignes et le modèle de PR HACS en vigueur.

La réussite de HACS Action et de Hassfest est un prérequis technique ; elle ne garantit pas à elle seule l'acceptation dans le catalogue HACS par défaut. Vérifier les consignes HACS au moment de la soumission.
