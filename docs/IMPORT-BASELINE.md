# Migration vers NBA Center HomeAssistant

**Dépôt source :** `cy-bertrand/ha-nba`  
**Dépôt cible :** `cy-bertrand/nba-center-ha`  
**Socle importé déclaré :** NBA Center v0.7.7c  
**Version du manifeste dans le dépôt cible :** 0.5.3 (provenance à réconcilier avant release)

## Objectif

Le nouveau dépôt prépare la distribution HACS de **NBA Center HomeAssistant**, tout en permettant de conserver l'ancienne intégration dans Home Assistant pour les tests comparatifs.

Les deux intégrations doivent pouvoir être installées simultanément :

- ancienne intégration : domaine technique `nba`, dossier `custom_components/nba` ;
- nouvelle intégration : domaine technique `nba_center`, dossier `custom_components/nba_center`.

Le domaine `nba` de l'ancienne intégration n'est pas réutilisé ni remplacé par ce dépôt.

## Isolation technique de la nouvelle intégration

La migration conserve la logique métier du socle importé, mais isole les identifiants Home Assistant de la nouvelle intégration. Attention : le numéro annoncé pour le socle importé (0.7.7c) ne correspond pas au champ `version` actuel du manifeste (0.5.3). Ce point doit être expliqué et le versionnement de release décidé avant de créer un tag. La version ne doit pas être modifiée au hasard :

- domaine et entrée de configuration : `nba_center` ;
- services : `nba_center.get_game_details` ;
- événements : `nba_center_game_start` et `nba_center_game_end` ;
- commandes WebSocket : préfixe `nba_center/` ;
- identifiants uniques des capteurs et appareil : namespace `nba_center` ;
- blueprint installé dans `blueprints/automation/nba_center/` ;
- carte Lovelace et exemples : capteurs `sensor.nba_center_*`.

Les appels ESPN, le coordinateur, les parseurs et les fonctionnalités de la carte restent dans la nouvelle intégration. Les identifiants de l'ancienne installation ne doivent pas être modifiés.

## Licence et propriété

Le propriétaire a confirmé détenir les droits sur le code source importé. Le **15 novembre 2026**, il a confirmé le passage du dépôt cible à la **licence MIT**, afin de permettre une distribution compatible avec les exigences de licence du magasin HACS par défaut.

La licence MIT autorise notamment l'utilisation commerciale, la modification et la redistribution du code, sous réserve de conserver l'avis de droit d'auteur et le texte de licence. Elle couvre uniquement le code sur lequel le projet détient les droits et ne confère aucun droit sur les marques, logos, images, données ou services de la NBA, d'ESPN ou de Home Assistant.

## État des validations

Le dépôt contient les tests Python, les fixtures ESPN et les tests/build frontend. Le workflow GitHub Actions est configuré pour exécuter ces vérifications et construire le bundle distribué.

La présence du workflow ne prouve pas à elle seule que les tests ont réussi. Les résultats CI doivent être vérifiés après le commit de migration. Un test d'installation et de fonctionnement sur une instance Home Assistant réelle reste également nécessaire avant une première publication HACS.

## Statut

La séparation des domaines techniques est une étape de migration. Elle ne constitue pas encore une validation complète de compatibilité, ni une publication officielle. Aucun tag de release ne doit être créé avant la validation CI, le contrôle HACS et le test en situation réelle.


## Vérification du versionnement avant publication — 15 novembre 2026

Une vérification complémentaire du dépôt source public `cy-bertrand/ha-nba` indique :

- son manifeste `custom_components/nba/manifest.json` annonce actuellement `0.4.1` ;
- sa dernière release publique observée est `v0.4.1` ;
- le manifeste du dépôt cible `nba-center-ha` annonce `0.5.3`.

La référence au socle importé `v0.7.7c` ci-dessus reste donc à expliquer : elle ne correspond ni au manifeste actuel du dépôt source ni à sa dernière release publiée. Ne pas déduire automatiquement le numéro de la première release NBA Center de cette référence. La décision de version est reportée jusqu'à la validation de la migration et du fonctionnement en coexistence. Voir [HACS-PUBLICATION.md](HACS-PUBLICATION.md).
