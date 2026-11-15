# Migration vers NBA Center HomeAssistant

**Dépôt source :** `cy-bertrand/ha-nba`  
**Dépôt cible :** `cy-bertrand/nba-center-ha`  
**Socle importé :** NBA Center v0.7.7c

## Objectif

Le nouveau dépôt prépare la distribution HACS de **NBA Center HomeAssistant**, tout en permettant de conserver l'ancienne intégration dans Home Assistant pour les tests comparatifs.

Les deux intégrations doivent pouvoir être installées simultanément :

- ancienne intégration : domaine technique `nba`, dossier `custom_components/nba` ;
- nouvelle intégration : domaine technique `nba_center`, dossier `custom_components/nba_center`.

Le domaine `nba` de l'ancienne intégration n'est pas réutilisé ni remplacé par ce dépôt.

## Isolation technique de la nouvelle intégration

La migration conserve la logique métier du socle importé, mais isole les identifiants Home Assistant de la nouvelle intégration :

- domaine et entrée de configuration : `nba_center` ;
- services : `nba_center.get_game_details` ;
- événements : `nba_center_game_start` et `nba_center_game_end` ;
- commandes WebSocket : préfixe `nba_center/` ;
- identifiants uniques des capteurs et appareil : namespace `nba_center` ;
- blueprint installé dans `blueprints/automation/nba_center/` ;
- carte Lovelace et exemples : capteurs `sensor.nba_center_*`.

Les appels ESPN, le coordinateur, les parseurs et les fonctionnalités de la carte restent dans la nouvelle intégration. Les identifiants de l'ancienne installation ne doivent pas être modifiés.

## Licence et propriété

Le propriétaire a confirmé détenir les droits sur le code source importé. Le dépôt cible utilise la **PolyForm Noncommercial License 1.0.0**, et non la licence GPL.

Cette licence couvre le code du projet dans les limites de ses conditions. Elle ne confère aucun droit sur les marques, logos, images, données ou services de la NBA, d'ESPN ou de Home Assistant.

## État des validations

Le dépôt contient les tests Python, les fixtures ESPN et les tests/build frontend. Le workflow GitHub Actions est configuré pour exécuter ces vérifications et construire le bundle distribué.

La présence du workflow ne prouve pas à elle seule que les tests ont réussi. Les résultats CI doivent être vérifiés après le commit de migration. Un test d'installation et de fonctionnement sur une instance Home Assistant réelle reste également nécessaire avant une première publication HACS.

## Statut

La séparation des domaines techniques est une étape de migration. Elle ne constitue pas encore une validation complète de compatibilité, ni une publication officielle. Aucun tag de release ne doit être créé avant la validation CI, le contrôle HACS et le test en situation réelle.
