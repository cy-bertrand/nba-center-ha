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

## Vérifications manuelles déjà réalisées

- Le dépôt a été ajouté comme dépôt personnalisé HACS de type Integration.
- L'utilisateur a confirmé que l'intégration enregistre automatiquement la ressource Lovelace en mode stockage.
- La carte `custom:nba-center-ha-card` se charge sur l'instance de test.

Ces vérifications portent sur le dépôt et la carte. Elles ne remplacent pas encore un test complet de coexistence des deux intégrations.

## Bloqueurs avant une première release

### 1. Test complet dans Home Assistant

Sur une instance de test, installer `nba_center` sans désinstaller l'ancienne intégration `nba`, puis vérifier :

1. Les deux intégrations apparaissent et restent configurables simultanément.
2. Les capteurs de la nouvelle intégration sont créés sous le namespace `nba_center`.
3. Le service `nba_center.get_game_details` fonctionne.
4. Les événements `nba_center_game_start` et `nba_center_game_end` sont émis correctement.
5. Le blueprint de notification est installé dans le dossier `nba_center` et fonctionne.
6. La carte NBA Center charge ses vues et reçoit les données.
7. L'ancienne intégration `nba`, ses capteurs, sa carte, ses ressources et ses automatisations restent fonctionnels.

### 2. Réconcilier le versionnement

État observé :

- Manifeste du dépôt cible : `0.5.3`.
- Manifeste actuel du dépôt source `ha-nba` : `0.4.1`.
- Dernière release publique observée sur le dépôt source : `v0.4.1`.
- Le document d'import mentionne un socle `0.7.7c`, qui ne correspond pas à ces valeurs.

Il faut clarifier l'origine de cette référence `0.7.7c` et décider du numéro de la première release de `nba-center-ha`. **Ne pas créer de tag ou de release avant cette décision.**

## Étapes de publication après validation

1. Fixer le numéro de version dans `manifest.json`.
2. Mettre à jour les notes de version et les instructions d'installation.
3. Relancer HACS Action, Hassfest et le build frontend sur le commit final.
4. Créer une **GitHub Release complète** (pas seulement un tag), après réussite des contrôles.
5. Soumettre le dépôt à `hacs/default`, dans la liste `integration`, en respectant l'ordre alphabétique et le modèle de PR HACS.

La réussite de HACS Action et de Hassfest est un prérequis technique ; elle ne constitue pas à elle seule une acceptation dans le catalogue HACS par défaut.
