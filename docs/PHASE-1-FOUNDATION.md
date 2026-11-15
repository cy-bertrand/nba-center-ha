# Phase 1 — Socle frontend NBA Center

**Statut dans le nouveau dépôt :** repris et adapté au domaine `nba_center` ; validation Home Assistant réelle à refaire.

## Socle repris

- Carte Lovelace Lit autonome, compilée et livrée dans `custom_components/nba_center/www/`.
- Enregistrement de la ressource par l'intégration.
- Interface NBA Dark responsive avec cinq vues.
- Utilisation des entités Home Assistant et des données fournies par le backend.
- Aucun appel ESPN direct depuis le navigateur.
- Ressource et élément Lovelace isolés de l'ancienne intégration : `/nba-center-ha/nba-center-card.js` et `custom:nba-center-ha-card`.

## Fonctionnalités présentes

- **HOME** : matchs live, prochaines rencontres, équipes favorites et leader points.
- **SCORES** : scoreboard, filtres par état et recherche par équipe.
- **TEAMS** : équipes favorites, dernier match, prochain match et forme récente.
- **PLAYERS** : catégories de leaders.
- **STATS** : classements Est/Ouest et leaders statistiques.

## Limites connues

- Le socle frontend a été validé dans une instance Home Assistant avant la séparation du domaine.
- Cette validation antérieure ne prouve pas que la nouvelle intégration `nba_center` s'installe et fonctionne correctement.
- Aucun test d'intégration Home Assistant ni test de coexistence avec l'ancienne intégration n'est encore déclaré pour le nouveau domaine.
- Les dashboards et ressources de l'ancienne intégration doivent rester inchangés pendant les essais.

## CI

Dernier workflow vérifié sur le nouveau dépôt : [run 43740025284](https://github.com/cy-bertrand/nba-center-ha/actions/runs/43740025284) — succès.

Il exécute la compilation Python, les tests unitaires Python, la vérification syntaxique JavaScript, le build Lit et les tests du bundle. Ces contrôles ne remplacent pas un test sur une instance Home Assistant réelle.

## Étape de validation restante

Sur une instance de test Home Assistant :
1. Installer la nouvelle intégration sans désinstaller l'ancienne.
2. Vérifier que les deux entrées d'intégration peuvent coexister.
3. Contrôler les capteurs, services, événements et blueprint de la nouvelle intégration.
4. Charger la carte NBA Center et vérifier ses cinq vues.
5. Vérifier que l'ancienne carte, ses capteurs et ses automatisations fonctionnent toujours.

Aucune release ne doit être publiée avant cette validation.
