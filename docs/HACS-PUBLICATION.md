# Préparation de publication HACS

Dernière vérification : **15 novembre 2026**.

## État des contrôles automatisés

Sur le commit `bca7f56aa42a3b33c3ce3f98d36856335be0cb55` :

- **HACS Action : réussi, 10 contrôles sur 10.**
- **Hassfest : réussi.**
- **Build frontend / tests Python et JavaScript : réussi.**
- Licence MIT détectée et validée par HACS.
- Icône de marque locale présente dans `custom_components/nba_center/brand/icon.png`.

Workflow de validation : https://github.com/cy-bertrand/nba-center-ha/actions/runs/43747202161  
Workflow frontend : https://github.com/cy-bertrand/nba-center-ha/actions/runs/43747202190

## Vérifications manuelles

- Le dépôt a été ajouté comme dépôt personnalisé HACS de type Integration.
- L'intégration enregistre automatiquement la ressource Lovelace en mode stockage.
- La carte `custom:nba-center-ha-card` se charge sur l'instance Home Assistant de test.
- L'installation et le fonctionnement de l'intégration ont été vérifiés sur l'instance réelle de l'utilisateur.

## Version de publication

La première version stable est fixée à **1.0.0**. Le manifeste de l'intégration porte cette version.

## Étapes restantes

1. Finaliser les ressources graphiques de marque aux formats et dimensions Home Assistant recommandés.
2. Vérifier une dernière fois HACS Action, Hassfest et le build frontend sur le commit de publication.
3. Créer la release GitHub **v1.0.0** avec ses notes de version.
4. Soumettre le dépôt à `hacs/default`, dans la liste `integration`, en respectant l'ordre alphabétique et le modèle de PR HACS.

La réussite de HACS Action et de Hassfest est un prérequis technique ; elle ne constitue pas à elle seule une acceptation dans le catalogue HACS par défaut.
