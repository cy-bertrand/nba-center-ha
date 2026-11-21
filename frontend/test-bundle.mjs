import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const bundle = await readFile("custom_components/nba_center/www/nba-center-card.js", "utf8");
const source = await readFile("frontend/src/nba-center-card.js", "utf8");
const translations = await readFile("frontend/src/translations.js", "utf8");
const manifest = JSON.parse(await readFile("custom_components/nba_center/manifest.json", "utf8"));

console.log("BUNDLE LENGTH", bundle.length, "SOURCE LENGTH", source.length);
assert.match(bundle, /CSSResult is not constructable|_$litType\\$|lit-html/, "Lit runtime must be bundled into the standalone card (not just the card source)");
assert.match(bundle, /nba-center-ha-card/, "custom card type must be present");
assert.match(bundle, /customElements\.define/, "custom element must be registered");
assert.match(bundle, /window\.customCards/, "Lovelace card metadata must be exposed");
assert.match(bundle, /SCORES & CALENDRIER/, "scores view must be included");
assert.match(bundle, /PLAYERS CENTER/, "players view must be included");
assert.match(source, /\{ id: "stats", label: "STANDINGS" \}/, "standings must be the unified navigation destination");
assert.doesNotMatch(source, /\{ id: "playoffs", label: "PLAYOFFS" \}/, "standalone PLAYOFFS navigation tab must be removed");
assert.match(source, /nba_center\/standings/, "historical regular-season standings must load through websocket");
assert.match(source, /_loadHistoricalStandings/, "season selector must load historical standings");
assert.match(source, /SAISON RÉGULIÈRE/, "standings center must switch between regular season and playoffs");
assert.match(source, /STANDINGS CENTER/, "unified standings center must be rendered");
assert.match(source, /nba_center\/playoff_bracket/, "playoffs view must use the Home Assistant websocket service");
assert.match(source, /TABLEAU DES PLAYOFFS/, "playoff bracket must be embedded in standings center");
assert.match(source, /_playoffSeriesCard\(series\)/, "playoff series must have a dedicated card renderer");
assert.match(source, /_openPlayoffSeries\(series\)/, "playoff series cards must open their game list");
assert.match(source, /_playoffSeriesOverlay\(\)/, "playoff series must have a dedicated match list overlay");
assert.match(source, /nba_center\/game_details/, "playoff game selection must reuse Match Center details");
assert.match(source, /playoff-game-row/, "playoff series overlay must list individual games");
assert.match(source, /declaredWinners = \(game\.teams \?\? \[\]\)\.filter\(\(team\) => team\.winner === true\)/, "playoff game winner must use ESPN's explicit winner flag");
assert.match(source, /winnerSide === "away" \? html/, "playoff game winner must be explicitly highlighted");
assert.match(source, /this\._standingPhase === "playoffs" \? 2008 : 2002/, "regular standings must retain history back to 2002-03");
assert.match(source, /this\._standingPhase === "playoffs" \? 2008 : 2002/, "playoff season selector must start at 2007-08 while regular standings start at 2002-03");
assert.match(source, /this\._standingSeason < 2008/, "switching to playoffs from an earlier regular season must select the first supported playoff season");
assert.match(source, /const BUILD_VERSION = __BUILD_VERSION__;/, "frontend build version must be injected from manifest.json");
assert.ok(bundle.includes(manifest.version), "bundle must contain the manifest version injected into the frontend footer");
assert.match(source, /home-daily-player-button/, "daily performance leaders must open their related match");
assert.match(source, /home-next-date/, "favorite next game date must be visually emphasized");
assert.match(source, /team\.live\?\.state === "in"/, "favorite teams must show LIVE only when the explicit game state is in");
assert.doesNotMatch(source, /\$\{team\.live \? html/, "favorite teams must not treat any live object as an active game");
assert.match(source, /@media\(max-width:390px\)/, "NBA Center must include a compact narrow-phone layout");
assert.match(source, /\.date-picker-control\{min-width:112px/, "score date picker must remain usable on narrow phones");
assert.match(source, /return \{ label: this\._t\("À VENIR"\), live: false, className: "scheduled" \}/, "upcoming game card must not duplicate its time in the footer");
assert.match(source, /_teamSelectedSeason/, "team profile must retain its selected NBA season");
assert.match(source, /type: "nba_center\/team_roster", team_id: String\(team\.id\), season_year: this\._teamSelectedSeason/, "team roster requests must include the selected season");
assert.match(source, /_selectTeamSeason\(year\)/, "team profile must reload when its season changes");
assert.match(source, /team-season-picker/, "team profile must expose a season selector");
assert.match(source, /this\._t\("5 DERNIERS MATCHS"\)/, "player game log heading must stay concise and translatable");
assert.doesNotMatch(source, /5 DERNIERS MATCHS · STATS INDIVIDUELLES/, "player game log heading must not include extra subtitle");
assert.match(source, /averageQuick\.map/, "season primary stats must show averages only, not games played or started");
assert.doesNotMatch(source, /player-participation/, "games played and starts must not be rendered as separate tiles");
assert.doesNotMatch(source.slice(source.indexOf("const quickDefinitions"), source.indexOf("const normalizeStatKey")), /\["GP"|\["GS"/, "GP and GS must not appear among primary stat tiles");
assert.match(source, /"gamesplayed", "gamesstarted", "fieldgoalsmadeattemptedpergame"/, "regular-season GP and GS must be first in the detailed stats table");
assert.match(source, /"gamesplayed", "gamesstarted", "fieldgoalsmade"/, "playoff GP and GS must be first in the detailed stats table");
assert.match(source, /postseasonAverageQuick\.map/, "playoff primary stats must show averages only, not games played or started");
assert.match(source, /\$\{this\._playerOverlay \? this\._playerProfilePanel\(\) : ""\}/, "player profile opened from a box score must render above Match Center");
assert.match(source, /_openPlayerRecentGame\(game\) \{[\s\S]*?this\._closePlayer\(\)/, "opening a recent game from a player profile must close the player overlay first");
assert.match(source, /\$\{this\._playerOverlay \? this\._playerProfilePanel\(\) : ""\}/, "player profile opened from a box score must render above Match Center");
assert.match(source, /details\?\.live_state\?\.competitors/, "Match Center header must use ESPN competition data for teams and scores");
assert.match(source, /home_away === "away"/, "Match Center header must identify the away team from ESPN competition metadata");
assert.match(source, /home_away === "home"/, "Match Center header must identify the home team from ESPN competition metadata");
assert.match(source, /score: competitor\.score/, "Match Center header must display official ESPN team scores");
assert.match(source, /_openPlayerRecentGame\(game\)/, "player recent game rows must open the corresponding Match Center game");
assert.match(source, /class="player-game-row player-game-row-button" type="button"/, "recent player games must be accessible clickable buttons");
assert.match(source, /@click=\$\{\(\) => this\._openPlayerRecentGame\(game\)\}/, "clicking a recent player game must trigger Match Center navigation");


assert.match(source, /playoff-series-button/, "playoff series cards must be visibly interactive");
assert.match(source, /@media\(max-width:760px\)\{\.playoff-round \.grid\{grid-template-columns:1fr\}\}/, "playoff series must use a single column on mobile");

assert.match(source, /series\.unknown_results \? "≥" : ""/, "playoff wins must be marked as minimum counts when results are unconfirmed");
assert.match(source, /_dataStatus\(\)/, "card must read the diagnostic sensor");
assert.match(source, /!\["À jour", "up_to_date"\]\.includes\(dataStatus\?\.state\)/, "unknown diagnostic states must be treated as degraded while accepting the stable up_to_date state");
assert.match(source, /this\._t\("Données partielles"\)/, "card must warn when core NBA feeds are degraded");
assert.match(source, /series\.unknown_results \? "≥" : ""/, "playoff wins must be marked as minimum counts when results are unconfirmed");
assert.match(source, /TÊTES DE SÉRIE NON VALIDÉES|Têtes de série non validées/, "unvalidated playoff seeds must be disclosed");
assert.match(bundle, /TABLEAU DES PLAYOFFS/, "bundled card must include the playoff bracket inside standings center");
assert.match(bundle, /NBA FINALS/, "bundled card must include NBA Finals");
assert.match(bundle, /RECENT FORM/, "favorite team recent form must be included in English");
assert.match(source, /_teamsCatalog\(\)/, "Teams Center must read the global franchise catalog sensor");
assert.match(source, /_teamCatalogCard\(team\)/, "Teams Center must render lightweight franchise cards");
assert.match(source, /nba_center\/team_roster/, "franchise detail must load its roster through Home Assistant websocket");
assert.match(source, /_teamRosterPanel\(\)/, "franchise roster overlay must be rendered");
assert.match(source, /request !== this\._teamRequest/, "stale franchise roster responses must not overwrite the currently selected team");
assert.match(source, /this\._teamRequest \+= 1/, "closing a franchise overlay must invalidate pending roster requests");
assert.match(source, /roster-injury/, "player injury status must be visible when supplied");
assert.match(source, /roster-headshot/, "roster player headshots must be supported");
assert.match(source, /team-season-summary/, "team detail must show the season standings summary");
assert.match(source, /teamRoster\.standing\.wins/, "team detail must show the wins/losses record");
assert.match(source, /teamRoster\.schedule\?\.recent/, "team detail must show recent form when available");
assert.match(source, /FICHE JOUEUR/, "roster players must open an individual profile");
assert.match(source, /RETOUR À L'EFFECTIF/, "player profile must return to the roster");
assert.match(bundle, /EFFECTIF/, "bundled card must include the franchise roster overlay");
assert.match(source, /FAVORI/, "Teams Center must distinguish favorite franchises");
assert.match(source, /catalog-favorite-tracking/, "favorite teams must expose their live tracking data");
assert.match(source, /home_away === "@"/, "recent form must mark away games with @");
assert.match(source, /height_cm/, "player profile must display metric height");
assert.match(source, /weight_kg/, "player profile must display metric weight");
assert.match(source, /scrollTo\(\{ top: 0/, "player selection must scroll the profile to the top");
assert.match(source, /Rechercher une équipe/, "Teams Center must include franchise search");
assert.match(source, /EAST/, "Teams Center must include conference filtering");
assert.match(source, /WEST/, "Teams Center must include conference filtering");
assert.match(bundle, /EASTERN CONFERENCE/, "standings view must be included");
assert.match(bundle, /Filter teams/, "interactive team search must be included");
assert.match(bundle, /nba_center\/scoreboard/, "date-based scoreboard websocket command must be used");
assert.match(bundle, /nba_center\/game_details/, "game details websocket command must be used");
assert.match(bundle, /MATCH CENTER/, "interactive match overlay must be included");
assert.match(source, /this\._t\("BOX SCORE · JOUEURS"\)/, "player box score label must use localization");
assert.match(translations, /"BOX SCORE · JOUEURS": "BOX SCORE · PLAYERS"/, "player box score must have an English translation");
assert.match(source, /game-leaders-grid/, "compact team leaders layout must be present");
assert.match(source, /game-leader-value/, "team leader values must be visually highlighted");
assert.match(source, /this\._t\("COMPARAISON DES ÉQUIPES"\)/, "team comparison label must use localization");
assert.match(translations, /"COMPARAISON DES ÉQUIPES": "TEAM COMPARISON"/, "team comparison must have an English translation");
assert.match(source, /this\._t\("SCORE PAR PÉRIODE"\)/, "quarter score label must use localization");
assert.match(translations, /"SCORE PAR PÉRIODE": "SCORING BY PERIOD"/, "quarter score must have an English translation");
assert.match(source, /ÉJECTÉ/, "player ejection status must be included");
assert.match(bundle, /period_display/, "ESPN period display labels must be used in play-by-play");
assert.match(source, /_quarterScorePanel\(\)/, "quarter score panel renderer must be present");
assert.match(source, /player\.ejected/, "player ejection metadata must be rendered");
assert.match(source, /const preferred = \["MIN", "PTS", "FG"/, "player points must appear immediately after minutes in the box score");
assert.match(source, /boxscore-player-link/, "player names in Match Center box scores must be interactive");
assert.match(source, /_openPlayer\(player\.id, \{ \.\.\.player, player: player\.name, team_id: block\.team_id/, "clicking a box-score player must open the profile with the player's franchise context");
assert.match(source, /const BUILD_VERSION = __BUILD_VERSION__;/, "frontend build version must be injected from manifest.json");
assert.ok(bundle.includes(manifest.version), "footer build version must match manifest.json");

assert.match(bundle, /player-table/, "responsive player statistics table must be included");
assert.match(bundle, /type="date"/, "calendar date picker must be included");
assert.match(bundle, /sensor\.nba_center_matchs_du_jour/, "existing NBA sensor default must be mapped");
assert.doesNotMatch(bundle, /site\.api\.espn\.com|site\.web\.api\.espn\.com/, "browser bundle must not call ESPN");
assert.doesNotMatch(bundle, /from\s*["']lit["']/, "Lit imports must be bundled, not external");
assert.match(source, /config\.entities/, "custom entity mapping must be configurable");
assert.match(source, /const shiftDateISO =/, "calendar date shifting must be timezone-independent");
assert.match(source, /localDateISO\(new Date\(\), this\.hass\?\.config\?\.time_zone\)/, "Today shortcut must use the Home Assistant timezone");
assert.match(source, /request !== this\._calendarRequest/, "stale calendar responses must not overwrite newer navigation");
assert.match(source, /_calendarStaleError/, "stale cache errors must be exposed to the user");
assert.match(source, /value\(away\.score\).*value\(home\.score\)/s, "match score must be displayed away first, home second");
assert.match(source, /this\._overlayGame\.away\?\.name[\s\S]*this\._overlayGame\.home\?\.name/, "Match Center overlay must show away team before home team");
assert.match(source, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/, "player profile and average-stat grids must use three compact columns");
assert.match(bundle, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/, "bundled player profile and average-stat grids must use three compact columns");
assert.match(source, /player-season-picker/, "season selector must have a dedicated placement above season averages");
assert.match(bundle, /player-season-picker/, "bundled season selector must be placed above season averages");
assert.match(source, /team_id: this\._teamOverlay\?\.id/, "opening a player from a roster must preserve the franchise ID");
assert.match(bundle, /team_id:this\._teamOverlay\?\.id/, "bundled roster player selection must preserve the franchise ID");
assert.match(source, /team_logo: this\._teamOverlay\?\.logo/, "roster player profile must carry the current team logo");
assert.match(bundle, /team_logo:this\._teamOverlay\?\.logo/, "bundled roster player profile must carry the current team logo");
assert.match(source, /\.player-game-row\{display:grid;grid-template-columns:66px 48px repeat\(6,minmax\(0,1fr\)\)/, "last five game rows must use aligned stat columns");
assert.match(bundle, /\.player-game-row\{display:grid;grid-template-columns:66px 48px repeat\(6,minmax\(0,1fr\)\)/, "bundled last five game rows must use aligned stat columns");
assert.match(source, /game\.result === "D" \? "loss" : "unknown"/, "unknown recent game outcomes must not be styled as losses");


assert.match(source, /nba_center\/player_leaders/, "Players Center must load season-specific ESPN leaderboards");
assert.match(source, /_setPlayersSeason/, "Players Center must expose a season selector");
assert.match(source, /_setPlayersPhase/, "Players Center must separate regular season and playoffs");
assert.match(source, /_playersLeadersCache/, "Players Center must cache leaderboards by season and phase");


const translationKeys = new Set([...translations.matchAll(/^\s*"((?:[^"\\]|\\.)+)"\s*:/gm)].map((match) => match[1]));
for (const [, key] of source.matchAll(/this\._t\("((?:[^"\\]|\\.)+)"\)/g)) {
  assert.ok(translationKeys.has(key), "Missing English translation for Lovelace label: " + key);
}
assert.match(source, /this\.hass\?\.locale\?\.language/, "Lovelace translations must follow the Home Assistant UI language");
assert.match(source, /aria-label=\$\{`\$\{this\._t\("Voir le match de"\)\} \$\{player\.player\}`\}/, "daily performance game links must have a localized accessible label");
assert.match(source, /this\._t\("Actualisation du match impossible\."\)/, "Match Center refresh fallback must use localization");
assert.match(translations, /"Voir le match de": "View the game for"/, "daily performance accessible label must have an English translation");
assert.match(translations, /"Actualisation du match impossible\.": "Unable to refresh game details\."/ , "Match Center refresh fallback must have an English translation");
assert.match(source, /const statusKey = dataStatus\?\.attributes\?\.status_key/, "data health must prefer the locale-independent status key");
assert.match(source, /statusKey \? statusKey !== "up_to_date" : !\["À jour", "up_to_date"\]\.includes\(dataStatus\?\.state\)/, "legacy data health sensors must keep their French-state fallback while accepting stable states");

console.log("NBA Center frontend bundle and feature checks passed.");

assert.match(source, /filtered\.slice\(-12\)/, "Match Center must show the latest 12 plays in chronological order");
assert.doesNotMatch(source, /const ordered = \[\.\.\.filtered\]\.reverse\(\)/, "Match Center must not reverse chronological plays");
assert.match(source, /const BUILD_VERSION = __BUILD_VERSION__;/, "frontend build version must be injected from manifest.json");
assert.ok(bundle.includes(manifest.version), "footer build version must match manifest.json");
assert.match(source, /\["avgMinutes","avgPoints","avgRebounds","avgAssists","avgBlocks","avgSteals"\]/, "career averages must not include career games played as an average tile");
assert.match(source, /career_statistics\?\.find\(\(row\) => row\.name === "gamesPlayed"\)/, "career games played must be displayed beside NBA experience");
assert.match(source, /player-game-header/, "recent games must use a compact column header");
assert.match(source, /grid-template-columns:66px 48px repeat\(6,minmax\(0,1fr\)\)/, "recent game stats must use compact aligned columns");
assert.match(source, /if \(result\.bio && String\(result\.bio\.id\) === String\(playerId\)\)/, "player profile must merge the verified Core API biography returned by the backend");
assert.doesNotMatch(source.slice(source.indexOf("async _openPlayer("), source.indexOf("async _loadPlayerPlayoffSeason")), /nba_center\/team_roster/, "player profile must not fall back to loading a team roster for biography");
assert.match(source, /"gamesplayed", "gamesstarted", "fieldgoalsmadeattemptedpergame"/, "regular-season GP and GS must lead the detailed stats table");
assert.match(source, /"gamesplayed", "gamesstarted", "fieldgoalsmade"/, "playoff GP and GS must lead the detailed stats table");
assert.doesNotMatch(source.slice(source.indexOf("const quickDefinitions"), source.indexOf("const normalizeStatKey")), /\["GP"|\["GS"/, "GP and GS must not be primary stat tiles");
assert.match(source, /const rows = \[\.\.\.chronologicalRows\]\.reverse\(\)/, "Match Center play-by-play must show the latest action first");
assert.match(source, /force: true/, "manual Match Center refresh must bypass cached game details");
assert.match(source, /ACTUALISER/, "Match Center play-by-play must expose a manual refresh button");
assert.match(source, /const statPriority = \[[\s\S]*?"fieldGoalsMade-fieldGoalsAttempted"[\s\S]*?"totalRebounds"[\s\S]*?"assists"[\s\S]*?"steals"[\s\S]*?"blocks"[\s\S]*?"turnovers"[\s\S]*?"fouls"/, "team statistics must follow a stable basketball priority order");
assert.match(source, /const priorityIndex = new Map\(statPriority\.map/, "unknown ESPN team statistics must remain supported after prioritized statistics");
if (!source.includes("_playByPlayPanel") || !source.includes("POINTS SEULEMENT") || !translations.includes('"FIL DU MATCH": "PLAY-BY-PLAY"')) {
  throw new Error("Play-by-play UI is missing from source or bundle");
}

if (!source.includes('this._t("Actualiser les détails du match")') || !translations.includes('"Actualiser les détails du match": "Refresh game details"')) {
  throw new Error("Match detail refresh/error state is missing");
}

assert.match(source, /leader-button/, "season leader rows must be clickable");
assert.match(source, /_openPlayer\(p\.id, p\)/, "clicking a season leader must open that player's profile");
assert.match(source, /Choisir la saison des classements joueurs/, "Players Center must expose historical season selection");
assert.match(source, /_leaderPanel\(key,10,postseason,this\._playersLeaders\.leaders/, "Players Center must render selected-season leaderboards");
assert.match(source, /opponent_abbreviation/, "recent player games must use the opponent's NBA abbreviation");
assert.match(source, /\["MIN",pick\("MIN","minutes"\)\]/, "recent player game stats must expose six labelled values");
assert.match(source, /player-game-stat/, "recent player game stats must use readable stat chips");
assert.match(bundle, /leader-button/, "bundled season leader rows must be clickable");
assert.match(bundle, /Choisir la saison des classements joueurs/, "bundled Players Center must expose historical season selection");
assert.match(bundle, /_playersLeaders\.leaders/, "bundled Players Center must render selected-season leaderboards");
assert.match(bundle, /opponent_abbreviation/, "bundled recent player games must use opponent abbreviations");

assert.match(source, /Web API v3\. On les affiche[\s\S]*directement/, "playoff highlights must use ESPN Web v3 averages directly");
assert.match(source, /const postseasonQuickDefinitions = \[[\s\S]*?\["PTS", "avgPoints"\]/, "playoff highlights must select ESPN per-game averages by their explicit stat identifiers");
assert.match(source, /const postseasonByName = Object\.fromEntries\([\s\S]*?String\(item\.name \?\? ""\)/, "playoff highlights must resolve only the exact ESPN statistic identifiers");
assert.doesNotMatch(source, /postseasonGameCount|postseasonPerGameValue/, "frontend must not recalculate playoff per-game averages");
assert.match(source, /postseasonDetailOrder/, "playoff detailed stats must use a stable basketball priority order");
assert.match(source, /postseason_stats/, "player profile must receive separate playoff statistics");
assert.match(source, /STATISTIQUES PLAYOFFS/, "player profile must display a separate postseason section");
assert.match(source, /_loadPlayerPlayoffSeason/, "player profile must load postseason stats for the selected year");
assert.match(source, /SAISON PLAYOFFS/, "player profile must offer a postseason year selector");
assert.match(source, /postseason_year: seasonYear/, "postseason selector must request the selected season from Home Assistant");
assert.match(source, /const selectedPlayoffSeason = seasonHistory\.find/, "playoff selector must resolve its own selected season");
assert.match(source, /this\._playerSelectedPlayoffSeason \|\| seasonHistory\[0\]\?\.year/, "playoff selector must not inherit the regular-season selection");
assert.match(source, /selectedPlayoffSeason\?\.display_name/, "playoff season heading must use the actual NBA season label");
assert.ok(source.includes("this._t(\"ÉTAT MÉDICAL\")"), "player medical status must occupy a translatable profile grid cell");
assert.doesNotMatch(source, /5 DERNIERS MATCHS · PLAYOFFS/, "player profile must not duplicate the recent game log for playoffs");

assert.match(source, /playoff_\$\{key\}/, "Players Center must resolve dedicated playoff leaderboard entities");
assert.match(source, /SAISON RÉGULIÈRE/, "Players Center must expose regular-season leaderboards");
assert.match(source, /PLAYOFFS/, "Players Center must expose playoff leaderboards");
assert.match(source, /_leaderPanel\(key,10,postseason,this\._playersLeaders\.leaders/, "Players Center must render top-ten leaders for the selected phase");
assert.ok(source.includes(".standing-team-button img{display:block;width:28px;height:28px"), "standings team logos must be constrained to compact icons");
assert.ok(source.includes("this._t(\"SÉRIE\")"), "standings streak heading must use localization");
assert.ok(source.includes("value(r.streak)"), "standings streak column must use the ESPN streak value");
assert.ok(source.includes("_standingsResultsCache = new Map()"), "standings seasons must be cached in the card");
assert.ok(source.includes("_playoffResultsCache = new Map()"), "playoff seasons must be cached in the card");
assert.ok(bundle.includes(".standing-team-button img{display:block;width:28px;height:28px"), "bundled standings logos must remain compact");
assert.ok(bundle.includes("standing-streak"), "bundled standings table must include streak styling");
assert.match(source, /standing-team-button/, "Stats Center standings teams must be interactive");
assert.match(source, /_openStandingTeam\(r\)/, "clicking a standings team must open its team profile");
assert.match(bundle, /standing-team-button/, "bundled Stats Center standings teams must be interactive");
assert.match(bundle, /_openStandingTeam/, "bundled standings team buttons must open team profiles");

assert.match(source, /<button class="form-chip[\s\S]*this\._openRecentTeamGame\(game\)/, "recent team form games must open Match Center with complete home/away scoreboard data");
assert.match(source, /_openRecentTeamGame\(game\)[\s\S]*?away: currentTeamIsAway \? currentTeam : opponent[\s\S]*?home: currentTeamIsAway \? opponent : currentTeam/, "recent team game adapter must map scores and teams to the correct home/away sides");
assert.match(source, /this\._teamOverlay \? this\._teamRosterPanel\(\) : ""/, "team profile opened from Match Center must render above it");
assert.match(bundle, /<button class="form-chip[\s\S]*this\._openRecentTeamGame\(t\)/, "bundled recent team form games must open Match Center with scoreboard data");
assert.match(bundle, /_openRecentTeamGame/, "bundled recent team game adapter must be present");
assert.match(bundle, /this\._teamOverlay\?this\._teamRosterPanel\(\):""/, "bundled team profile must render above Match Center");

assert.match(source, /Le bilan et le calendrier restent affichés/, "missing roster must not hide team season results");

assert.ok(["HOME", "SCORES", "TEAMS", "PLAYERS", "STANDINGS"].every((label) => source.includes(`label: "${label}"`)), "main navigation labels must remain English regardless of locale");
assert.match(source, /\$\{v\.label\}/, "navigation labels must not be translated");
assert.match(source, /\$\{active\.label\}/, "footer navigation label must remain English");
assert.ok(source.includes("_formatDate(raw, fallback ="), "backend ISO dates must be formatted with the Home Assistant frontend locale");
assert.ok(source.includes("this._formatDate(this._overlayGame.date"), "Match Center dates must use the frontend locale");
assert.match((await readFile(new URL("./src/translations.js", import.meta.url), "utf8")), /"m": "G"/, "French match abbreviation must map to English games abbreviation");

assert.match(source, /Le bilan et le calendrier restent affichés/, "team summary must remain visible without a roster");

assert.match(source, /PARCOURS EN PLAYOFFS/, "team profile must display the selected season playoff path");
assert.match(source, /Effectif historique non proposé/, "historical team rosters must be explicitly disabled");
assert.match(source, /NBA Center affiche uniquement l’effectif de la saison actuelle/, "historical team profile must explain that only current rosters are supported");
assert.match(source, /team-playoff-path/, "team playoff path must have a dedicated panel");

assert.match(source, /nba_center\/team_playoff_path/, "selected season playoff path must load through its websocket endpoint");
assert.match(source, /_loadTeamPlayoffPath\(team, this\._teamSelectedSeason, request\)/, "selected season playoff path must load after the fast roster request");

assert.match(source, /player\.nationality/, "player profile header must show available nationality");
assert.match(source, /player\.birth_place/, "player profile header must show available birthplace");
assert.match(source, /date-weekday/, "score date selector must show the abbreviated weekday");
assert.doesNotMatch(source, /date-label/, "score view must not repeat the selected date outside the date picker");
assert.match(source, /DRAFT NBA/, "player profile must show the NBA draft instead of college");
assert.doesNotMatch(source.slice(source.indexOf("_playerProfilePanel()"), source.indexOf("render() {")), /player\.college/, "player profile must not depend on college data");

assert.match(source, /_openMatchTeam\(team\)/, "Match Center team logos must open the corresponding franchise profile");
assert.match(source, /match-team-logo-button/, "Match Center team logos must be accessible clickable controls");
assert.match(source, /this\._t\("Ouvrir la fiche"\)/, "Match Center logo buttons must have localized descriptive accessible labels");
assert.match(source, /this\._t\("Ouvrir la fiche"\)/, "Match Center team logo accessible labels must use localization");
assert.match(translations, /"Ouvrir la fiche": "Open profile for"/, "Match Center team logo accessible labels must have an English translation");
assert.match(source, /this\._closeOverlay\(\);[\s\S]*?this\._openTeam\(selectedTeam\)/, "opening a team from Match Center must close the Match Center first");
assert.match(bundle, /match-team-logo-button/, "bundled Match Center team logos must be clickable");
assert.match(bundle, /this\._teamOverlay\?this\._teamRosterPanel\(\):""/, "bundled team profile must overlay Match Center");

assert.match(source, /this\._closeTeamOverlay\(\);[\s\S]*?this\._openGame\(/, "opening a recent team game must close the team profile first");
assert.match(source, /\.player-overlay\{z-index:10001\}/, "player profile overlay must appear above the team profile");
assert.match(source, /class="overlay team-overlay"/, "team profile must use a single stable overlay layer");
assert.match(source, /\.team-overlay\{z-index:9999\}/, "team profile must use the standard overlay layer");

assert.match(source, /_scoreTimelinePanel\(\)/, "Match Center must render the score timeline panel");
assert.match(source, /home - away/, "score timeline must plot home minus away point differential");
assert.match(source, /score-timeline-zero/, "score timeline must show the zero lead-change baseline");
assert.match(source, /score-timeline-tooltip/, "score timeline must expose score and margin on hover");
assert.match(source, /48 \+ overtimeCount \* 5/, "score timeline must extend its time axis for overtime periods");
assert.match(translations, /"SCORE TIMELINE": "SCORE TIMELINE"/, "score timeline labels must have an English translation");


assert.match(source, /_scoreTimelineHover: \{ state: true \}/, "score timeline hover state must be reactive");
