# Plan de tests — NBA Center HomeAssistant

## Principes

- Tester le backend Python et le frontend JavaScript séparément.
- Vérifier les contrats publics des entités, services, événements et automatisations.
- Vérifier le rendu et les interactions de la carte Lovelace sur une instance Home Assistant réelle.
- Ne jamais considérer une réussite CI comme un substitut aux tests fonctionnels en conditions réelles.
- Pour les données ESPN absentes ou incomplètes, vérifier que l'interface affiche un état neutre plutôt qu'une valeur inventée.
- Vérifier les saisons, dates et heures dans le fuseau horaire de Home Assistant.

## Tests automatisés

- Compilation Python.
- Tests unitaires et tests de parsing.
- Tests sur fixtures ESPN : match terminé, match en direct, prolongation et boxscore partiel.
- Vérification syntaxique JavaScript.
- Tests du bundle frontend.
- Build du bundle frontend et synchronisation avec le fichier distribué.
- Validation HACS Action.
- Validation Hassfest.

## Tests fonctionnels Home Assistant

### Intégration et services

- Configuration et chargement de l'intégration.
- Création et mise à jour des capteurs.
- Fonctionnement du service `nba_center.get_game_details`.
- Émission des événements de début et de fin de match.
- Installation et fonctionnement du blueprint de notification.
- Comportement en cas d'erreur réseau, de réponse ESPN vide/incomplète et de cache.

### Installation frontend

- Enregistrement automatique de la ressource Lovelace en mode Storage.
- Chargement de la carte après installation ou mise à jour de l'intégration.
- Vérification du mode YAML avec déclaration manuelle de la ressource.
- Vérification qu'aucune compilation n'est requise sur Home Assistant.

### Carte et navigation

- Affichage de l'accueil, des scores, classements, équipes, joueurs et détails de match.
- Navigation entre les sections et retour depuis les vues de détail.
- Ouverture et fermeture des panneaux/détails.
- Vérification des filtres et des favoris lorsqu'ils sont disponibles.
- Vérification de l'affichage sur mobile et écran plus large.
- Vérification des états sans données et des chargements.

### Match Center

- Ordre domicile/extérieur des équipes et des scores.
- Boxscore : joueurs, minutes et statistiques dans le bon ordre.
- Play-by-Play : ordre chronologique, périodes et données absentes.
- Match en direct, terminé, prolongation et données partielles.
- Cohérence des meilleurs joueurs et des statistiques d'équipe.

### Teams Center

- Chargement de la liste des équipes et de leur fiche.
- Filtrage Est/Ouest.
- Affichage de la conférence et de la division lorsque les données ESPN les fournissent.
- Calendrier, résultats récents et informations de saison.
- Vérifier que le chargement des équipes reste réactif et ne déclenche pas de recherches historiques de rosters non nécessaires.

### Players Center et profils

- Recherche, liste et ouverture d'une fiche joueur.
- Logo de l'équipe actuelle et équipe associée à chaque saison lorsque disponible.
- Sélection d'une saison et cohérence de l'équipe affichée.
- Statistiques de saison régulière et playoffs clairement distinguées.
- Moyennes par match : vérifier qu'elles ne sont pas confondues avec des totaux.
- Ordre logique des statistiques principales et détaillées.
- Unités de taille et de poids cohérentes.
- Cinq derniers matchs : dates, ordre et indication domicile/extérieur.

### Classements et playoffs

- Classements Est/Ouest, rangs et statistiques.
- Données de playoffs et play-in, séries et résultats.
- Gestion des saisons et des données ESPN manquantes.

### Temps et localisation

- Vérification des fuseaux horaires et des changements de date.
- Correspondance entre dates ESPN et dates affichées dans Home Assistant.
- Vérification autour de minuit et lors des changements d'heure.

## Critères de validation

- Aucun appel ESPN direct depuis le frontend.
- Pas de valeur statistique fabriquée pour compléter un champ absent.
- Pas de régression des entités, services, événements ou automatisations existants.
- Les vues principales restent utilisables sur mobile.
- Le bundle distribué est à jour par rapport aux sources.
