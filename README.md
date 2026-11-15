# NBA Center HomeAssistant

**NBA Dark · ESPN sans clé API · Home Assistant · Lovelace**

NBA Center HomeAssistant est une intégration Home Assistant avec un centre NBA complet dans Lovelace : matchs, équipes, joueurs, statistiques et suivi des rencontres.

## Fonctionnalités
- Intégration Home Assistant autonome avec backend Python.
- Carte Lovelace NBA Center construite avec Lit et compilée avec esbuild.
- Données ESPN centralisées côté backend ; aucun appel ESPN direct depuis le frontend.
- Cache des données, gestion des erreurs et respect du fuseau horaire Home Assistant.
- Capteurs, services, événements et automatisations historiques conservés.

## Installation
Le dépôt est conçu pour être installé avec HACS comme intégration personnalisée. Recherchez **NBA Center HomeAssistant** dans HACS ou ajoutez ce dépôt comme dépôt personnalisé de type **Integration**.

Après installation, redémarrez Home Assistant puis ajoutez l'intégration NBA depuis **Paramètres → Appareils et services**.

La carte Lovelace est enregistrée automatiquement par l'intégration. Les exemples de configuration se trouvent dans [lovelace/](lovelace/) et les instructions complémentaires dans [docs/FRONTEND-INSTALLATION.md](docs/FRONTEND-INSTALLATION.md).

## Développement frontend
Le code source Lit se trouve dans `frontend/src/nba-center-card.js`. Le bundle distribué à Home Assistant est généré dans `custom_components/nba/www/nba-center-card.js`.

```bash
npm ci
npm run build
npm test
```

Le bundle compilé est versionné dans le dépôt ; Home Assistant n'a pas besoin de Node.js ni d'esbuild pour exécuter l'intégration.

## Principes techniques
- Le backend Python/Home Assistant est la seule couche qui communique avec ESPN.
- Pas de réécriture inutile des fonctionnalités Python existantes.
- Cache centralisé et gestion tolérante des erreurs.
- Pas de statistiques inventées ou extrapolées.
- Fuseaux horaires gérés par Home Assistant.
- Les changements frontend sont validés par les tests et le build avant publication.

## Licence
Le code original de NBA Center HomeAssistant est distribué sous **PolyForm Noncommercial License 1.0.0**. Cette licence autorise les usages non commerciaux, y compris l'utilisation personnelle, l'étude, les modifications et la redistribution dans les conditions prévues par la licence.

Toute utilisation commerciale nécessite une autorisation distincte du titulaire des droits.

Texte officiel : https://polyformproject.org/licenses/noncommercial/1.0.0

**Important :** cette licence couvre uniquement le code sur lequel le projet détient les droits. Elle ne confère aucun droit sur ESPN, la NBA, les marques, logos, images, données ou autres contenus de tiers. Ceux-ci restent soumis à leurs propres conditions et droits.

## Remerciements et droits tiers
Les données sportives sont obtenues à partir des services ESPN accessibles publiquement. NBA Center HomeAssistant est un projet indépendant, non affilié, approuvé ou sponsorisé par la NBA, ESPN ou Home Assistant.

Consultez [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) pour les précisions relatives aux éléments tiers.