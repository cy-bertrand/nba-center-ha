// NBA Center Lovelace card — reads only Home Assistant entity state. Lit is bundled locally.
import { LitElement, css, html } from "lit";
import { translate } from "./translations.js";

// Takes the build version directly from manifest.json
const BUILD_VERSION = __BUILD_VERSION__;

const VIEWS = [
  { id: "home", label: "ACCUEIL" },
  { id: "scores", label: "SCORES" },
  { id: "teams", label: "ÉQUIPES" },
  { id: "players", label: "JOUEURS" },
  { id: "stats", label: "CLASSEMENT" },
];
const LEADERS = {
  points: ["POINTS", "marque"],
  rebounds: ["REBONDS", "rebon"],
  assists: ["PASSES", "passe"],
  steals: ["INTERCEPTIONS", "inter"],
  blocks: ["CONTRES", "contr"],
};
const DEFAULT_ENTITIES = {
  games: "sensor.nba_center_matchs_du_jour",
  status: "sensor.nba_center_etat_du_flux_principal",
  east: "sensor.nba_center_classement_est",
  west: "sensor.nba_center_classement_ouest",
  points: "sensor.nba_center_meilleurs_marqueurs",
  rebounds: "sensor.nba_center_meilleurs_rebondeurs",
  assists: "sensor.nba_center_meilleurs_passeurs",
  steals: "sensor.nba_center_meilleurs_intercepteurs",
  blocks: "sensor.nba_center_meilleurs_contreurs",
};
const localDateISO = (date = new Date(), timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const shiftDateISO = (isoDate, days) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
};
const value = (v, fallback = "—") => v === null || v === undefined || v === "" ? fallback : String(v);
const fmtDate = (v) => {
  if (!v) return "Date à confirmer";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? value(v) : new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(d);
};

class NBACenterCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _active: { state: true },
    _filter: { state: true },
    _search: { state: true },
    _selectedDate: { state: true }, _calendarGames: { state: true },
    _calendarLoading: { state: true }, _calendarError: { state: true }, _calendarStale: { state: true },
    _overlayGame: { state: true }, _overlayDetails: { state: true },
    _overlayLoading: { state: true }, _overlayError: { state: true },
    _showAllPlays: { state: true }, _scoringOnly: { state: true },
    _teamSearch: { state: true }, _teamConference: { state: true },
    _teamOverlay: { state: true }, _teamRoster: { state: true }, _teamPlayoffPath: { state: true }, _teamPlayoffLoading: { state: true }, _teamRosterLoading: { state: true }, _teamRosterError: { state: true }, _teamRequest: { state: true }, _teamSelectedSeason: { state: true },
    _playerSearch: { state: true }, _playerOverlay: { state: true }, _expandedPlayerPhoto: { state: true }, _playerData: { state: true }, _playerLoading: { state: true }, _playerError: { state: true }, _playerRequest: { state: true }, _playerSelectedSeason: { state: true }, _playerSelectedPlayoffSeason: { state: true }, _playerPlayoffLoading: { state: true },
    _playoffData: { state: true }, _playoffLoading: { state: true }, _playoffError: { state: true }, _playoffSeason: { state: true }, _playoffRequest: { state: true },
    _playersSeason: { state: true }, _playersPhase: { state: true }, _playersLeaders: { state: true }, _playersLoading: { state: true }, _playersError: { state: true }, _playersRequest: { state: true },
    _standingSeason: { state: true }, _standingPhase: { state: true }, _seasonStandings: { state: true }, _seasonStandingsLoading: { state: true }, _seasonStandingsError: { state: true }, _seasonStandingsRequest: { state: true },
  };

  _t(key) { return translate(key, this.hass?.locale?.language ?? this.hass?.language ?? "fr"); }

  static styles = css`
    :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif)}
    *{box-sizing:border-box}
    .shell{overflow:hidden;border:1px solid var(--divider-color);border-radius:18px;background:#090e17;color:#f4f6fb;box-shadow:0 12px 32px #0005}
    .hero{position:relative;padding:24px 26px 20px;background:radial-gradient(ellipse at 88% 0%,#2c4772 0,transparent 48%),linear-gradient(120deg,#14233a,#090e17 75%);border-bottom:1px solid #ffffff14}
    .hero:after{content:"";position:absolute;right:24px;bottom:-1px;width:92px;height:3px;background:#e7b54d}
    .eyebrow{color:#e8b74e;font-size:12px;font-weight:800;letter-spacing:.24em}
    h1{margin:8px 0 4px;font-size:clamp(30px,4.8vw,43.2px);line-height:1;letter-spacing:-.045em;font-weight:950}
    .subtitle{color:#aab6ca;font-size:14.4px}
    .meta{display:flex;gap:5px;align-items:center;margin-top:12px;color:#aab6ca;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
    .data-health{padding:4px 7px;border-radius:999px;font-size:10.8px;font-weight:900;letter-spacing:.06em}.data-health.healthy{color:#83d8a9;background:#83d8a91a}.data-health.degraded{color:#ffca70;background:#ffca701a}
    .data-warning{margin-top:12px;padding:9px 11px;border:1px solid #8b6838;border-radius:9px;background:#8b68381c;color:#f2d19a;font-size:12px;line-height:1.5}
    .dot{width:7px;height:7px;border-radius:50%;background:#e8b74e;box-shadow:0 0 0 4px #e8b74e22}
    nav{display:flex;gap:5px;overflow-x:auto;padding:10px 12px;background:#0c1421;border-bottom:1px solid #ffffff12;scrollbar-width:thin}
    button{border:0;border-radius:9px;background:transparent;color:#8997ad;padding:10px 14px;min-width:76px;cursor:pointer;font:inherit;font-size:12px;font-weight:800;letter-spacing:.09em;white-space:nowrap}
    button:hover{color:#fff;background:#ffffff0a}
    button[aria-selected=true]{background:#1c2d47;color:#f2c45f;box-shadow:inset 0 0 0 1px #d9a83d55}
    button:focus-visible,input:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    main{padding:22px;min-height:260px;background:linear-gradient(180deg,#0a101a,#0c1420)}
    .head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 16px}
    h2{margin:0;font-size:21.6px;letter-spacing:-.025em}
    h3{margin:0;font-size:14.4px;letter-spacing:.1em;color:#dce3ef}
    .muted{color:#8f9db2;font-size:13.2px}
    .pill{border:1px solid #2c3b52;border-radius:999px;color:#aab6ca;padding:5px 9px;font-size:10.8px;font-weight:800;letter-spacing:.08em}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .home-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px;padding:4px 2px}.home-heading .eyebrow{font-size:10.8px;color:#f2c45f;font-weight:900;letter-spacing:.2em}.home-heading h2{margin:5px 0 3px;font-size:27.6px;letter-spacing:.04em}.home-heading p{margin:0;color:#8f9db2;font-size:13.2px}.home-kicker{display:block;margin-bottom:5px;color:#8d9db4;font-size:9.6px;font-weight:900;letter-spacing:.15em}.home-live{margin-bottom:12px;border-color:#35465f;background:radial-gradient(ellipse at 90% 0%,#233650 0%,transparent 45%),linear-gradient(145deg,#152338,#0e1725)}.home-live .panel-head h3,.home-section-heading h3{font-size:18px;letter-spacing:.1em}.home-live-count{color:#8f9db2;font-size:10.8px;font-weight:900;letter-spacing:.08em}.home-live-count.is-live{color:#ff858b}.home-game-list{display:grid;gap:8px}.home-game-list .game{background:#0d1725}.home-empty{display:flex;align-items:center;gap:13px;padding:12px 4px 4px}.home-empty-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#ffffff0b;font-size:26.4px}.home-empty strong{font-size:14.4px}.home-empty p{margin:4px 0 0;color:#8f9db2;font-size:12px}.home-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.home-favorite-list{display:grid;gap:2px}.home-favorite{display:flex;align-items:center;gap:10px;width:100%;padding:9px 2px;border:0;border-bottom:1px solid #ffffff10;background:transparent;color:inherit;text-align:left;cursor:pointer}.home-favorite:last-child{border-bottom:0}.home-favorite:hover{background:#ffffff08}.home-favorite img,.home-favorite-placeholder{width:35px;height:35px;flex:0 0 35px;object-fit:contain}.home-favorite-placeholder{display:grid;place-items:center;border-radius:9px;background:#ffffff0a}.home-favorite-main{min-width:0;flex:1}.home-favorite-main strong{display:block;font-size:13.2px}.home-favorite-main small{display:block;margin-top:3px;color:#8999b0;font-size:9.6px;letter-spacing:.04em}.home-next-label{display:block;margin-top:5px;color:#8d9db4;font-size:9.6px;font-weight:900;letter-spacing:.13em}.home-next-date{display:block;margin-top:2px;color:#f2c45f;font-size:15.6px;font-weight:950;line-height:1.25;letter-spacing:.01em}.home-opponent-logo{display:inline-block;width:17px;height:17px;vertical-align:middle;margin-right:4px;object-fit:contain}.home-favorite-arrow{color:#f2c45f;font-size:25.2px}.home-form{display:flex;gap:4px;margin-top:5px}.home-form i{display:grid;place-items:center;width:16px;height:16px;border-radius:4px;background:#ffffff0b;color:#aab6ca;font-size:9.6px;font-style:normal;font-weight:900}.home-form i.win{color:#75d6a0;background:#75d6a018}.home-form i.loss{color:#ef8d8d;background:#ef8d8d18}.home-highlights{margin-top:18px}.home-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.home-section-heading h3{margin:0}.home-leaders-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.home-leaders-grid .panel{padding:11px}.home-leaders-grid .leader{grid-template-columns:16px 29px minmax(0,1fr) auto;gap:6px}.home-leaders-grid .avatar{width:28px;height:28px}.home-leaders-grid .player{font-size:12px}.home-leaders-grid .stat{font-size:13.2px}.home-leaders-grid .panel-head h3{font-size:12px}.home-daily-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.home-daily-panel{padding:12px}.home-daily-panel .panel-head h3{font-size:12px}.home-daily-unit{color:#f2c45f;font-size:10.8px;font-weight:950}.home-daily-list{display:grid;gap:8px}.home-daily-player{display:grid;grid-template-columns:15px 30px minmax(0,1fr) auto;align-items:center;gap:7px;padding:6px 0;border-bottom:1px solid #ffffff10}.home-daily-player-button{width:100%;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.home-daily-player-button:hover{background:#ffffff0a}.home-daily-player-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}.home-daily-player:last-child{border-bottom:0}.home-daily-rank{color:#8b9ab0;font-size:10.8px;font-weight:900}.home-daily-player img,.home-daily-avatar{width:29px;height:29px;border-radius:50%;object-fit:cover;background:#25344a}.home-daily-info{min-width:0}.home-daily-info strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.home-daily-info small{display:block;margin-top:3px;color:#8999b0;font-size:9.6px}.home-daily-player>b{color:#f2c45f;font-size:14.4px;font-weight:950;white-space:nowrap}

    .panel{min-width:0;border:1px solid #25344a;border-radius:13px;padding:14px;background:linear-gradient(145deg,#121e2e,#0e1725)}
    .panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
    .accent{color:#f0c05b}
    .empty{border:1px dashed #33445e;border-radius:13px;padding:20px;background:#101a29}
    .playoff-season{max-width:132px;border:1px solid #2b3b52;border-radius:9px;background:#101a29;color:#f2c45f;padding:9px;font:inherit;font-size:13.2px;font-weight:800}.playoff-summary{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}.playoff-summary span{border:1px solid #2c3b52;border-radius:999px;padding:6px 10px;color:#aab6ca;font-size:10.8px;font-weight:800;letter-spacing:.08em}.playoff-conference{margin-top:22px}.playoff-conference-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.playoff-conference-title h2{font-size:19.2px;color:#f2c45f}.playoff-round{margin:14px 0}.playoff-round .grid{grid-template-columns:repeat(2,minmax(0,1fr))}.playoff-series{padding:12px}.playoff-series-button{display:block;width:100%;min-width:0;text-align:left;color:inherit;cursor:pointer;transition:border-color .15s,transform .15s}.playoff-series-button:hover{border-color:#bd9448;transform:translateY(-1px);background:linear-gradient(145deg,#17263a,#101a29)}.playoff-series-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}.playoff-series-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.playoff-series-round{color:#9eabc0;font-size:10.8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.playoff-team{display:grid;grid-template-columns:25px 28px minmax(0,1fr) 28px;align-items:center;gap:8px;padding:9px 2px;border-bottom:1px solid #ffffff12;font-size:14.4px}.playoff-team:last-of-type{border-bottom:0}.playoff-team-logo{width:25px;height:25px;max-width:25px;max-height:25px;object-fit:contain}.playoff-seed{color:#8291a7;font-size:12px;font-weight:800}.playoff-wins{text-align:center;color:#f2c45f;font-size:20.4px;font-weight:950}.playoff-winner strong{color:#75d6a0}.playoff-series-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;padding-top:9px;border-top:1px solid #ffffff12;color:#8190a7;font-size:9.6px;letter-spacing:.06em}.playoff-series-bottom strong{color:#f2c45f;font-size:9.6px;white-space:nowrap}.playoff-warning{margin-top:8px;color:#e8b75a;font-size:12px;line-height:1.5}.playoff-series-detail-summary{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}.playoff-series-detail-summary>strong{color:#f2c45f;font-size:24px}.playoff-game-list{display:grid;gap:8px}.playoff-game-row{display:grid;grid-template-columns:75px minmax(0,1fr) minmax(0,1fr) 12px;align-items:center;gap:8px;width:100%;min-width:0;padding:11px;border:1px solid #27364b;border-radius:10px;background:#101a29;color:#e9eef7;text-align:left;cursor:pointer}.playoff-game-row:hover{border-color:#bd9448;background:#17263a}.playoff-game-row:disabled{opacity:.65;cursor:default}.playoff-game-number{color:#f2c45f;font-size:10.8px;font-weight:900}.playoff-game-number small{display:block;margin-top:4px;color:#8796ac;font-size:9.6px;font-weight:500}.playoff-game-team{display:grid;grid-template-columns:23px minmax(0,1fr) auto;align-items:center;gap:5px;min-width:0}.playoff-game-team img{width:22px;height:22px;object-fit:contain}.playoff-game-team strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.playoff-game-team b{font-size:16.8px;color:#aab6ca}.playoff-game-row.winner-away .playoff-game-team:nth-of-type(2) strong,.playoff-game-row.winner-home .playoff-game-team:nth-of-type(3) strong{color:#75d6a1}.playoff-game-row.winner-away .playoff-game-team:nth-of-type(2) b,.playoff-game-row.winner-home .playoff-game-team:nth-of-type(3) b{color:#f2c45f;font-size:20.4px}.playoff-winner-label{grid-column:2 / -1;color:#75d6a1;font-size:8.4px;font-weight:900;letter-spacing:.1em}.playoff-game-open{color:#f2c45f;font-size:24px}.playoff-series-overlay .overlay-panel{width:min(620px,100%)}.playoff-series-overlay .overlay-head h2{font-size:16.8px}.playoff-warning{margin-top:8px;color:#e8b75a;font-size:12px;line-height:1.5}.playoff-conference .empty{margin-top:8px}
    .empty strong{display:block;margin-bottom:7px;color:#e9edf5;font-size:15.6px}
    .empty p{margin:0;color:#9eabc0;font-size:13.2px;line-height:1.65}
    .game-list,.team-list,.leader-list{display:grid;gap:9px}
    .game{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px;border:1px solid #27364b;border-radius:11px;background:#101a29}
    .game-main{min-width:0;display:grid;gap:8px}
    .game-date{color:#8e9cb1;font-size:12px}
    .matchup{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:9px}
    .side{min-width:0;display:flex;align-items:center;gap:7px}
    .side.away{justify-content:flex-end;text-align:right}
    .team-name{min-width:0;font-size:14.4px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .logo{width:25px;height:25px;object-fit:contain;flex:0 0 auto}
    .score{font-size:20.4px;font-weight:900;font-variant-numeric:tabular-nums;white-space:nowrap}
    .pending{color:#8f9db2;font-size:13.2px}
    .status{min-width:75px;text-align:right;color:#9eabc0;font-size:12px;line-height:1.45}.status.live{color:#ff858b;font-weight:950}.status.live:before{content:"●";display:inline-block;margin-right:5px;font-size:9.6px;animation:nba-live-pulse 1.5s ease-in-out infinite}.status.final{color:#9eabc0;font-weight:800}.status.scheduled{color:#f2c45f;font-weight:800}.side.winner .team-name{color:#75d6a0}.side.winner .logo{filter:drop-shadow(0 0 5px #75d6a055)}.game.live-game{border-color:#75404b;background:linear-gradient(110deg,#241923,#101a29)}.game.live-game .score{color:#ff858b}.game.final-game .score{color:#f2c45f}@keyframes nba-live-pulse{50%{opacity:.35}}
    .live{color:#ff777d;font-weight:900}
    .filters{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-bottom:14px}
    .chip{min-width:0;padding:7px 10px;border:1px solid #2b3b52;color:#a6b2c6;border-radius:999px;font-size:10.8px}
    .chip[aria-pressed=true]{color:#f5c45e;background:#1a2b43;border-color:#876b35}
    input{min-width:140px;flex:1;border:1px solid #2b3b52;border-radius:9px;background:#0c1522;color:#f4f6fb;padding:9px 11px;font:inherit;font-size:13.2px}
    .team-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #ffffff10}
    .team-row:last-child{border-bottom:0;padding-bottom:0}
    .team-row:first-child{padding-top:0}
    .catalog-team{min-width:0;cursor:pointer;transition:border-color .15s,transform .15s}.catalog-team:hover{border-color:#bd9448;transform:translateY(-1px)}.catalog-team:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}.catalog-favorite-note{margin-top:8px}
    .large{width:34px;height:34px}
    .team-info{min-width:0;flex:1}
    .team-info strong{display:block;font-size:14.4px}
    .team-info small{display:block;margin-top:3px;color:#8f9db2;font-size:12px}
    .record{text-align:right;font-size:13.2px;font-weight:800;color:#dce3ef}
    .recent{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .form-chip{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid #2b3b52;border-radius:7px;color:#aab6ca;font-size:10.8px;min-width:0;cursor:pointer;text-align:left}.form-chip:hover{border-color:#bd9448;background:#1b2a40}.form-chip:disabled{opacity:.6;cursor:default}
    .form-chip strong{font-size:10.8px}
    .form-chip.win strong{color:#72d5a0}
    .form-chip.loss strong{color:#ff8b91}
    .form-chip.unknown strong{color:#aab6ca}
    .leader{display:grid;grid-template-columns:24px 34px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #ffffff10}
    .leader:last-child{border-bottom:0}
    .leader-button{width:100%;min-width:0;margin:0;padding:8px 0;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
    .leader-button:hover{background:#1b2a40}
    .leader-button:active{transform:translateY(1px)}
    .leader-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .rank{color:#8190a7;font-size:12px;font-weight:900}
    .avatar{width:32px;height:32px;object-fit:cover;border-radius:50%;background:#25344a}
    .player{min-width:0;font-size:13.2px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .player small{display:block;color:#8f9db2;font-size:10.8px;margin-top:3px;font-weight:500}
    .stat{color:#f2c45f;font-size:15.6px;font-weight:900;font-variant-numeric:tabular-nums}
    .standing-team-button{display:inline-flex;align-items:center;gap:7px;padding:2px 4px;margin:-2px 0;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-weight:800;cursor:pointer;text-align:left}
    .standing-team-button:hover{background:#1b2a40;color:#f2c45f}
    .standing-team-button:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .standing-streak{text-align:right;color:#f2c45f;font-weight:900;font-variant-numeric:tabular-nums}
    .standing-team-button img{display:block;width:28px;height:28px;max-width:28px;max-height:28px;object-fit:contain;flex:0 0 28px}
    .team-standing-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:10px}.team-standing-grid.historical{grid-template-columns:repeat(3,minmax(0,1fr))}.team-standing-grid>div{min-width:0;padding:10px 9px;background:#ffffff08;border:1px solid #ffffff08;border-radius:10px}.team-standing-grid small{display:block;color:#8290a5;font-size:10.8px;letter-spacing:.07em}.team-standing-grid strong{display:block;margin-top:5px;color:#eef3fb;font-size:16.8px;font-weight:900;font-variant-numeric:tabular-nums;white-space:nowrap}.team-playoff-path{display:grid;gap:10px;margin-top:14px}.team-playoff-path-round{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:10px;padding:12px;border:1px solid #34445c;border-radius:13px;background:linear-gradient(115deg,#18263a,#101a29 72%);box-shadow:inset 3px 0 #d5a94e}.team-playoff-path-number{display:grid;place-items:center;width:29px;height:29px;border-radius:9px;background:#2b3c55;color:#f5ca70;font-size:13.2px;font-weight:950}.team-playoff-path-round strong{display:block;font-size:12px;letter-spacing:.09em;color:#9eacc0}.team-playoff-opponent{display:flex;align-items:center;gap:9px;margin-top:6px;min-width:0}.team-playoff-opponent img{width:34px;height:34px;object-fit:contain;flex:0 0 34px;filter:drop-shadow(0 2px 4px #0008)}.team-playoff-opponent span{font-size:14.4px;font-weight:850;color:#edf2fa;overflow-wrap:anywhere}.team-playoff-path-score{display:flex;align-items:center;gap:8px}.team-playoff-path-score b{color:#f5ca70;font-size:22.8px;font-weight:950;font-variant-numeric:tabular-nums;white-space:nowrap}.team-playoff-path-status{grid-column:2 / -1;justify-self:start;padding:4px 8px;border-radius:20px;background:#ffffff0b;font-size:9.6px;font-weight:900;letter-spacing:.09em}.team-playoff-path-status.win{color:#75d6a0;background:#75d6a018}.team-playoff-path-status.loss{color:#ef8d8d;background:#ef8d8d18}.team-playoff-path-status.live{color:#f2c45f;background:#f2c45f18}@media(max-width:620px){.team-standing-grid>div{padding:8px 6px}.team-standing-grid small{font-size:9.6px}.team-standing-grid strong{font-size:14.4px}.team-playoff-path-round{padding:10px;gap:8px}.team-playoff-opponent img{width:30px;height:30px;flex-basis:30px}}
    .table-wrap{overflow-x:auto}
    table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}
    th{text-align:left;color:#8190a7;font-size:10.8px;letter-spacing:.08em;padding:8px 7px;border-bottom:1px solid #314158}
    td{padding:9px 7px;border-bottom:1px solid #ffffff0e;color:#d7deea}
    td:first-child{color:#e9bb57;font-weight:900}
    .date-nav{display:flex;align-items:center;gap:7px;margin-bottom:13px;flex-wrap:wrap}
    .date-nav button{border:1px solid #2b3b52;background:#101a29;color:#dce3ef;min-width:40px}
    .date-picker-control{display:flex;align-items:center;gap:5px;flex:1;min-width:0;padding:0 9px;border:1px solid #2b3b52;border-radius:9px;background:#101a29;color:#f2c45f}
    .date-weekday{font-size:12px;font-weight:900;letter-spacing:.04em;white-space:nowrap}
    .date-picker-control input[type=date]{min-width:0;flex:1;padding:9px 2px;border:0;background:transparent;color:#f4f6fb;font:inherit;font-size:13.2px}
    .date-picker-control input[type=date]:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .game{cursor:pointer;transition:border-color .15s,transform .15s}
    .game:hover{border-color:#bd9448;transform:translateY(-1px)}
    .game:focus-visible{outline:2px solid #f2c45f;outline-offset:2px}
    .overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:#02060dcc;backdrop-filter:blur(5px)}
    .overlay-panel{width:min(720px,100%);max-height:90vh;overflow:auto;border:1px solid #34465f;border-radius:17px;background:#0d1726;color:#f4f6fb;box-shadow:0 24px 70px #000b}
    .overlay-head{display:flex;justify-content:space-between;align-items:center;padding:17px 19px;border-bottom:1px solid #ffffff16}
    .overlay-body{padding:18px}.overlay-teams{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;text-align:center}
    .overlay-team img{width:54px;height:54px;object-fit:contain}.overlay-team strong{display:block;margin-top:7px;font-size:14.4px}
    .overlay-score{font-size:28.8px;font-weight:950;color:#f2c45f}.overlay-actions{display:flex;align-items:center;gap:7px}.overlay-refresh{min-width:0;padding:8px 10px;border:1px solid #34465f;color:#e8bb58;font-size:10.8px}.overlay-refresh:disabled{opacity:.55;cursor:wait}.overlay-close{min-width:38px;padding:8px;border:1px solid #34465f}
    .game-leaders-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.game-leader-card{padding:12px;min-width:0}.game-leader-card .panel-head{margin-bottom:7px}.game-leader-card .panel-head h3{font-size:14.4px;letter-spacing:.08em}.game-leader{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #ffffff12}.game-leader-category{color:#e8bb58;font-size:10.8px;font-weight:900;letter-spacing:.08em}.game-leader-name{font-size:13.2px;font-weight:750;overflow-wrap:anywhere}.game-leader-value{color:#f2c45f;font-size:15.6px;font-weight:950;font-variant-numeric:tabular-nums}.game-leaders-empty{color:#91a0b5;font-size:12px;padding:7px 0}@media(max-width:760px){.playoff-round .grid{grid-template-columns:1fr}}
    .game .logo{width:32px;height:32px}.home-daily-player img,.home-daily-avatar{width:36px;height:36px}.leader-list .avatar{width:38px;height:38px}.player-profile-overlay .roster-headshot{width:64px;height:64px}.player-profile-overlay .player-team-logo{width:36px;height:36px}.player-photo-trigger{display:inline-flex;flex:0 0 auto;padding:0;border:0;border-radius:50%;background:transparent;cursor:zoom-in}.player-photo-trigger .roster-headshot{display:block;transition:transform .15s,box-shadow .15s}.player-photo-trigger:hover .roster-headshot{transform:scale(1.06);box-shadow:0 0 0 2px #f2c45f}.player-photo-trigger:focus-visible{outline:2px solid #f2c45f;outline-offset:4px}.player-photo-lightbox{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:24px;background:#03070ddd;cursor:zoom-out}.player-photo-lightbox img{display:block;max-width:min(88vw,680px);max-height:86vh;width:auto;height:auto;object-fit:contain;border-radius:14px;box-shadow:0 20px 70px #000b}.player-photo-lightbox button{position:absolute;top:18px;right:18px;width:44px;height:44px;padding:0;border:1px solid #ffffff44;border-radius:50%;background:#172338;color:#fff;font-size:22px;cursor:pointer}
    @media(max-width:620px){.home-heading h2{font-size:22.8px}.home-grid{grid-template-columns:1fr}.home-leaders-grid{grid-template-columns:1fr}.home-daily-grid{grid-template-columns:1fr}.home-daily-panel{padding:12px}.home-leaders-grid .panel{padding:12px}.home-leaders-grid .leader{grid-template-columns:24px 34px minmax(0,1fr) auto}.home-leaders-grid .avatar{width:32px;height:32px}.home-leaders-grid .player{font-size:13.2px}.home-leaders-grid .stat{font-size:15.6px}.home-live .game{grid-template-columns:1fr;gap:5px}.home-live .status{text-align:left}
.playoff-game-row{grid-template-columns:62px minmax(0,1fr) minmax(0,1fr) 10px;gap:5px;padding:9px}.playoff-game-team{grid-template-columns:20px minmax(0,1fr) auto;gap:4px}.playoff-game-team img{width:19px;height:19px}.playoff-game-team strong{font-size:10.8px}.game-leaders-grid{grid-template-columns:1fr;gap:8px}.game-leader-card{padding:10px}.game-leader{padding:6px 0}}
    .quarter-score-panel{margin-top:12px}.quarter-score-panel table{width:100%;border-collapse:collapse;font-size:12px}.quarter-score-panel th,.quarter-score-panel td{padding:9px 8px;text-align:center;border-bottom:1px solid #ffffff10;font-variant-numeric:tabular-nums}.quarter-score-panel th:first-child,.quarter-score-panel td:first-child{text-align:left}.quarter-score-panel td:last-child{color:#f2c45f;font-weight:900}
    .boxscore-section{margin-top:22px}.section-kicker{color:#e8b74e;font-size:10.8px;font-weight:900;letter-spacing:.2em;margin-bottom:5px}.boxscore-section>h3{margin:0 0 12px}
    .boxscore-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.boxscore-panel{padding:10px;min-width:0}.player-table-wrap{overflow-x:auto;max-width:100%}.player-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}.player-table th,.player-table td{padding:8px 6px;text-align:right;border-bottom:1px solid #ffffff10;font-variant-numeric:tabular-nums}.player-table th:first-child,.player-table td:first-child{text-align:left;position:sticky;left:0;background:#111d2c}.player-table th{color:#94a5bc;font-size:9.6px;letter-spacing:.08em}.player-table tr.starter td{background-color:#17263a}.player-table tr.dnp td{color:#75849a}
    .playbyplay-panel{margin-top:12px}.play-controls{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}
    .play-list{list-style:none;padding:0;margin:0;display:grid;gap:5px}
    .play-row{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 9px;border:1px solid #ffffff0d;border-radius:8px;background:#0d1725}
    .play-row.scoring{border-color:#8a6b35;background:#1b2430}
    .play-clock{font-size:12px;font-weight:900;color:#f0c05b}.play-clock small{display:block;color:#94a5bc;font-size:10.8px;margin-top:3px}
    .play-copy{font-size:12px;line-height:1.45;color:#dce3ef}.play-copy small{display:block;color:#f0c05b;font-size:9.6px;font-weight:900;letter-spacing:.1em;margin-top:3px}
    .play-score{font-size:12px;font-weight:900;color:#aab6ca;font-variant-numeric:tabular-nums}
    .play-more{display:block;margin:10px auto 0;border:1px solid #2b3b52;background:#101a29;color:#e8bb58}.player-cell{display:flex;align-items:center;gap:6px;min-width:112px;white-space:normal}.player-cell img{width:25px;height:25px;object-fit:contain;border-radius:50%}.player-cell small{display:block;color:#91a0b5;font-size:9.6px;margin-top:2px}.boxscore-player-link{min-width:0;padding:0;border:0;border-radius:0;background:transparent;color:#e9eef7;font:inherit;font-size:12px;font-weight:850;letter-spacing:0;text-align:left;white-space:normal}.boxscore-player-link:hover{color:#f2c45f;background:transparent;text-decoration:underline}.team-stats-panel{margin-top:12px}.team-stats-panel table{width:100%;border-collapse:collapse;font-size:12px}.team-stats-panel th,.team-stats-panel td{padding:8px;text-align:right;border-bottom:1px solid #ffffff10}.team-stats-panel th:first-child,.team-stats-panel td:first-child{text-align:left;color:#aab6ca}
    @media(max-width:620px){.overlay{padding:8px}.overlay-panel{max-height:94vh}.boxscore-grid{grid-template-columns:1fr}.player-table th,.player-table td{padding:7px 5px}}
    .team-season-picker{display:flex;align-items:center;gap:8px;margin-top:7px;color:#8290a5;font-size:10.8px;letter-spacing:.06em}.team-season-picker select{background:#151c28;color:#f2f5fa;border:1px solid #ffffff20;border-radius:7px;padding:6px 9px;font-size:13.2px}.team-roster-heading{display:flex;align-items:center;gap:12px}.roster-list{display:grid;gap:7px}.roster-player{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px;padding:9px;border:1px solid #ffffff10;border-radius:10px;background:#101a29}.roster-headshot{width:40px;height:40px;object-fit:cover;border-radius:50%;background:#25344a}.roster-placeholder{background:#25344a}.roster-player-info{min-width:0}.roster-player-button{width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer}.roster-player-button:hover,.roster-player-button:focus-visible{background:#1c2a40;border-color:#8da9d8;outline:none}.player-profile-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px}.player-profile-grid>div{padding:6px}.player-stat-grid{gap:5px;margin:6px 0}.player-stat-grid>div{padding:6px}.player-stat-grid strong{font-size:15.6px}.player-season-highlights{grid-template-columns:repeat(3,minmax(0,1fr));margin:3px 0 8px} .player-season-highlights>div{padding:5px}.player-gamelog{margin-top:9px}.player-team-logo{width:28px;height:28px;object-fit:contain;flex:0 0 auto}.player-game-list{display:grid;gap:0}.player-game-row{display:grid;grid-template-columns:66px 48px repeat(6,minmax(0,1fr));gap:4px;align-items:center;padding:9px 2px;border-top:1px solid #ffffff12;text-align:center;font-size:12px}.player-game-row-button{width:100%;border-left:0;border-right:0;border-bottom:0;background:transparent;color:inherit;font:inherit;cursor:pointer}.player-game-row-button:not(:disabled):hover{background:#ffffff0a}.player-game-row-button:disabled{opacity:.55;cursor:default}.player-game-header{border-top:0;border-bottom:1px solid #ffffff18;padding:5px 2px;color:#8290a5;font-size:9.6px;font-weight:800;letter-spacing:.04em}.player-game-date{color:#f2c45f;white-space:nowrap;font-size:10.8px}.player-game-opponent{color:#c6d0df;white-space:nowrap;font-size:10.8px;overflow:hidden;text-overflow:ellipsis}.player-game-cell{color:#e7edf7;font-variant-numeric:tabular-nums;font-size:12px}.player-profile-grid>div{display:flex;flex-direction:column;gap:3px;padding:8px;background:#ffffff08;border-radius:8px}.player-profile-grid small{color:#8290a5;font-size:10.8px;letter-spacing:.07em}.player-profile-grid strong{font-size:15.6px;color:#eef3fb}.team-season-summary{margin-bottom:14px}.roster-player-info strong{display:block;font-size:13.2px}.roster-player-info small{display:block;color:#91a0b5;font-size:10.8px;margin-top:3px}.roster-player-info .roster-injury{color:#ffb66d}.roster-number{text-align:right}.roster-number strong{display:block;color:#f2c45f;font-size:14.4px}.roster-number small{display:block;color:#91a0b5;font-size:9.6px;margin-top:3px}.team-roster-overlay{width:min(620px,100%)}.team-overlay{z-index:9999}.player-overlay{z-index:10001}.match-team-logo-button{display:inline-flex;align-items:center;justify-content:center;min-width:0;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}.match-team-logo-button:hover{background:#ffffff12;outline:1px solid #f2c45f}.match-team-logo-button:focus-visible{outline:2px solid #f2c45f;outline-offset:4px}.match-team-logo-button img{display:block;width:58px;height:58px;object-fit:contain}.team-roster-overlay .overlay-body{max-height:calc(90vh - 86px);overflow-y:auto;overscroll-behavior:contain;scroll-behavior:smooth}.catalog-favorite-tracking{display:grid;gap:5px;margin-top:10px;padding-top:9px;border-top:1px solid #ffffff12;color:#aab6ca;font-size:10.8px;line-height:1.4;letter-spacing:.04em}
    .player-result{display:grid;grid-template-columns:24px 38px minmax(0,1fr) auto;align-items:center;gap:9px;width:100%;padding:9px 7px;border-bottom:1px solid #ffffff10;text-align:left;color:inherit;border-radius:8px}.player-result:hover{background:#1b2a40}.player-result:last-child{border-bottom:0}.player-profile-overlay{width:min(760px,100%)}.player-profile-overlay .overlay-body{max-height:calc(90vh - 80px);overflow:auto;overscroll-behavior:contain}.player-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0}.player-stat-grid>div{padding:8px;border-radius:8px;background:#ffffff08}.player-stat-grid small{display:block;color:#91a0b5;font-size:9.6px;letter-spacing:.08em}.player-stat-grid strong{display:block;margin-top:4px;color:#f2c45f;font-size:16.8px}.player-gamelog{margin-top:14px}.player-gamelog table{min-width:520px}.player-gamelog td:not(:first-child),.player-gamelog th:not(:first-child){text-align:right}
    .footer{display:flex;justify-content:space-between;gap:10px;padding:12px 22px;color:#738199;border-top:1px solid #ffffff12;font-size:10.8px;letter-spacing:.06em}
    @media(max-width:620px){.game .logo{width:28px;height:28px}.player-game-meta{font-size:12px}.player-game-stats{font-size:10.8px}.player-profile-grid small{font-size:9.6px}.player-profile-grid strong{font-size:14.4px}.player-stat-grid small{font-size:8.4px}.player-stat-grid strong{font-size:14.4px}.hero{padding:20px 17px 17px}main{padding:15px}nav{padding:8px 7px}button{min-width:66px;padding:9px 10px}.grid{grid-template-columns:1fr}.game{grid-template-columns:minmax(0,1fr);gap:7px;padding:11px}.status{text-align:left;min-width:0;white-space:normal}.matchup{gap:6px}.side{gap:4px}.team-name{font-size:12px}.logo{width:28px;height:28px}.score{font-size:18px}.date-nav{gap:5px}.date-nav button{min-width:36px;padding:8px 9px;font-size:10.8px}.date-picker-control{min-width:130px}.date-weekday{font-size:10.8px}.date-picker-control input[type=date]{font-size:12px}.home-favorite{align-items:flex-start;padding:11px 2px}.home-favorite-main{padding-top:2px}.home-next-date{font-size:14.4px;overflow-wrap:anywhere}.footer{padding:11px 15px}.meta{margin-top:11px;flex-wrap:wrap;row-gap:7px}}@media(max-width:390px){.game .logo{width:26px;height:26px}main{padding:11px}.hero{padding:18px 14px 15px}.home-heading h2{font-size:21.6px}.matchup{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:4px}.team-name{font-size:10.8px}.logo{width:25px;height:25px}.score{font-size:15.6px}.status{font-size:10.8px}.date-nav button{min-width:32px;padding:8px 7px}.date-picker-control{min-width:112px;padding:0 6px}.date-weekday{display:none}.footer{font-size:9.6px}}
  `;

  constructor() {
    super();
    this._active = "home";
    this._filter = "all";
    this._search = "";
    this._teamSearch = "";
    this._teamConference = "all";
    this._teamOverlay = null;
    this._teamRoster = null;
    this._teamPlayoffPath = null;
    this._teamPlayoffLoading = false;
    this._teamRosterLoading = false;
    this._teamRosterError = "";
    this._teamRequest = 0;
    this._selectedPlayer = null;
    this._playerSearch = ""; this._playerOverlay = null; this._expandedPlayerPhoto = null; this._playerData = null; this._playerLoading = false; this._playerError = ""; this._playerSelectedSeason = ""; this._playerSelectedPlayoffSeason = ""; this._playerPlayoffLoading = false; this._playerPlayoffRequest += 1; this._playerPlayoffRequest = 0; this._playerRequest = 0;
    this._selectedDate = localDateISO();
    this._calendarGames = []; this._calendarLoading = false; this._calendarError = ""; this._calendarStale = false; this._calendarStaleError = ""; this._calendarRequest = 0; this._calendarInitialized = false;
    this._overlayGame = null; this._overlayDetails = null; this._overlayRequest = 0;
    this._overlayLoading = false; this._overlayError = ""; this._overlayRefreshTimer = null;
    this._playoffData = null; this._playoffLoading = false; this._playoffError = ""; this._playoffSeason = 2027; this._playoffRequest = 0;
    this._playersSeason = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0); this._playersPhase = "regular"; this._playersLeaders = null; this._playersLoading = false; this._playersError = ""; this._playersRequest = 0; this._playersLeadersCache = new Map();
    this._standingSeason = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0); this._standingPhase = "regular"; this._seasonStandings = null; this._seasonStandingsLoading = false; this._seasonStandingsError = ""; this._seasonStandingsRequest = 0;
    this._standingsResultsCache = new Map(); this._playoffResultsCache = new Map();
    this._seriesOverlay = null;
    this._config = {};
  }

  setConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Configuration NBA Center invalide : un objet YAML est attendu.");
    }
    this._config = {
      title: "NBA CENTER HomeAssistant",
      subtitle: "Your league. Your teams. One center.",
      ...config,
      entities: { ...DEFAULT_ENTITIES, ...(config.entities ?? {}) },
    };
  }

  getCardSize() { return 8; }
  get _states() { return this.hass?.states ?? {}; }
  _state(id) { return id ? this._states[id] : undefined; }
  _find(predicate) { return Object.values(this._states).find(predicate); }

  _entity(key, predicate) {
    return this._state(this._config.entities?.[key]) ?? this._find(predicate);
  }

  _dataStatus() {
    return this._entity("status", (state) => state.attributes?.scope === "scoreboard, standings, calendriers favoris, classements et catalogue des équipes");
  }

  _games() {
    const state = this._entity("games", (s) => Array.isArray(s.attributes?.games) && !s.attributes?.team_id);
    return { state, rows: state?.attributes?.games ?? [] };
  }

  _standings(slug) {
    const state = this._entity(slug, (s) => {
      if (!Array.isArray(s.attributes?.standings)) return false;
      const id = s.entity_id.toLowerCase();
      return slug === "east" ? id.includes("classement_est") || id.includes("eastern") :
        id.includes("classement_ouest") || id.includes("western");
    });
    return { state, rows: state?.attributes?.standings ?? [] };
  }

  _leaders(key, postseason = false) {
    const fragment = LEADERS[key][1];
    const state = this._entity(postseason ? `playoff_${key}` : key, (s) => {
      const category = (s.attributes?.category ?? "").toLowerCase();
      return Array.isArray(s.attributes?.leaders) && category.includes(fragment) &&
        (postseason ? category.startsWith("playoffs ") : !category.startsWith("playoffs "));
    });
    return { state, rows: state?.attributes?.leaders ?? [] };
  }

  _teams() {
    const teams = {};
    for (const state of Object.values(this._states)) {
      const attrs = state.attributes ?? {};
      if (!state.entity_id.startsWith("sensor.") || !attrs.team_id) continue;
      const id = String(attrs.team_id);
      const friendly = (attrs.friendly_name ?? state.entity_id).toLowerCase();
      const team = teams[id] ??= {
        id,
        name: (attrs.friendly_name ?? id).replace(/ (dernier match|prochain match|match en cours|derniers matchs)$/i, ""),
        logo: attrs.team_logo,
      };
      team.logo ??= attrs.team_logo;
      if (friendly.includes("dernier match")) team.last = attrs;
      if (friendly.includes("prochain match")) team.next = attrs;
      if (friendly.includes("match en cours")) team.live = attrs;
      if (Array.isArray(attrs.games)) team.recent = attrs.games;
    }
    return Object.values(teams).sort((a,b) => a.name.localeCompare(b.name));
  }

  _teamsCatalog() {
    const state = this._find((s) => s.entity_id?.startsWith("sensor.") &&
      Array.isArray(s.attributes?.teams) && s.attributes?.expected_count === 30);
    const catalog = state?.attributes ?? {};
    const favorites = new Map(this._teams().map((team) => [String(team.id), team]));
    return {
      state,
      complete: Boolean(catalog.complete),
      count: Number(catalog.count ?? catalog.teams?.length ?? 0),
      teams: (catalog.teams ?? []).map((team) => ({
        ...team,
        favorite: favorites.has(String(team.id)),
        favoriteData: favorites.get(String(team.id)),
      })).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    };
  }

  async _openTeam(team) {
    const request = ++this._teamRequest;
    const now = new Date();
    const defaultSeason = now.getFullYear() + (now.getMonth() >= 9 ? 1 : 0);
    this._teamSelectedSeason = this._teamSelectedSeason ?? defaultSeason;
    this._teamOverlay = team;
    this._teamRoster = null;
    this._teamPlayoffPath = null;
    this._teamPlayoffLoading = true;
    this._teamRosterError = "";
    this._teamRosterLoading = true;
    this._loadTeamPlayoffPath(team, this._teamSelectedSeason, request);
    try {
      const roster = await this.hass.callWS({ type: "nba_center/team_roster", team_id: String(team.id), season_year: this._teamSelectedSeason });
      if (request !== this._teamRequest || String(this._teamOverlay?.id) !== String(team.id)) return;
      this._teamRoster = roster;
    } catch (err) {
      if (request !== this._teamRequest || String(this._teamOverlay?.id) !== String(team.id)) return;
      this._teamRosterError = err?.message ?? "Effectif indisponible.";
    } finally {
      if (request === this._teamRequest) this._teamRosterLoading = false;
    }
  }

  async _loadTeamPlayoffPath(team, seasonYear, request) {
    try {
      const result = await this.hass.callWS({ type: "nba_center/team_playoff_path", team_id: String(team.id), season_year: Number(seasonYear) });
      if (request !== this._teamRequest || String(this._teamOverlay?.id) !== String(team.id)) return;
      this._teamPlayoffPath = result ?? null;
    } catch (err) {
      if (request === this._teamRequest) this._teamPlayoffPath = null;
    } finally {
      if (request === this._teamRequest) this._teamPlayoffLoading = false;
    }
  }
  async _selectTeamSeason(year) {
    const season = Number(year);
    if (!Number.isInteger(season) || season < 2002 || season > 2100 || !this._teamOverlay) return;
    this._teamSelectedSeason = season;
    this._selectedPlayer = null;
    await this._openTeam(this._teamOverlay);
  }

  _closeTeamOverlay() {
    this._teamRequest += 1;
    this._teamOverlay = null;
    this._teamRoster = null;
    this._teamRosterLoading = false;
    this._teamRosterError = "";
    this._selectedPlayer = null;
  }

  _teamRosterPanel() {
    const players = this._teamRoster?.players ?? [];
    return html`
      <div class="overlay team-overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closeTeamOverlay(); }}>
        <section class="overlay-panel team-roster-overlay" role="dialog" aria-modal="true" aria-label=${this._t("Effectif de l'équipe")}>
          <header class="overlay-head">
            <div class="team-roster-heading">
              ${this._teamOverlay?.logo ? html`<img class="logo large" src=${this._teamOverlay.logo} alt="">` : ""}
              <div><h2>${value(this._teamOverlay?.display_name, this._teamOverlay?.name)}</h2>
                <div class="muted">${value(this._teamOverlay?.abbreviation)} · ${value(this._teamRoster?.season, this._t("Effectif NBA"))}</div>
                <label class="team-season-picker">${this._t("SAISON")}
                  <select .value=${String(this._teamSelectedSeason ?? this._teamRoster?.season_year ?? new Date().getFullYear())} @change=${(event) => this._selectTeamSeason(event.target.value)}>
                    ${Array.from({ length: Math.max(1, (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) - 2002 + 1) }, (_, index) => new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0) - index).map((year) => html`<option value=${year}>${year - 1}-${String(year).slice(-2)}</option>`)}
                  </select>
                </label></div>
            </div>
            <button class="overlay-close" aria-label=${this._t("Fermer la fiche équipe")} @click=${this._closeTeamOverlay}>✕</button>
          </header>
          <div class="overlay-body">
            ${this._selectedPlayer ? html`
              <section class="panel player-profile-card">
                <div class="panel-head"><h3>${this._t("FICHE JOUEUR")}</h3><button class="chip" @click=${() => { this._selectedPlayer = null; }}>${this._t("RETOUR À L'EFFECTIF")}</button></div>
                <div class="team-row">${this._selectedPlayer.headshot ? html`<img class="roster-headshot" src=${this._selectedPlayer.headshot} alt="">` : ""}
                  <div class="team-info"><strong>${value(this._selectedPlayer.name)}</strong><small>${value(this._selectedPlayer.position)} · ${this._selectedPlayer.jersey ? `#${this._selectedPlayer.jersey}` : "N° —"}</small></div></div>
                <div class="player-profile-grid">
                  <div><small>${this._t("ÂGE")}</small><strong>${value(this._selectedPlayer.age)}</strong></div><div><small>${this._t("TAILLE")}</small><strong>${this._selectedPlayer.height_cm == null ? "—" : `${this._selectedPlayer.height_cm} cm`}</strong></div>
                  <div><small>${this._t("POIDS")}</small><strong>${this._selectedPlayer.weight_kg == null ? "—" : `${this._selectedPlayer.weight_kg.toLocaleString(this.hass?.locale?.language ?? this.hass?.language ?? "fr-BE")} kg`}</strong></div><div><small>${this._t("EXPÉRIENCE")}</small><strong>${this._selectedPlayer.experience_years == null ? "—" : `${this._selectedPlayer.experience_years} ans`}</strong></div>
                  <div><small>${this._t("STATUT")}</small><strong>${value(this._selectedPlayer.status)}</strong></div><div><small>${this._t("UNIVERSITÉ / CLUB")}</small><strong>${value(this._selectedPlayer.college)}</strong></div>
                </div>
                ${this._selectedPlayer.injuries?.length ? html`<p class="roster-injury">${this._t("ÉTAT MÉDICAL ESPN")} : ${this._selectedPlayer.injuries.map((injury) => value(injury.status)).filter(Boolean).join(" · ")}</p>` : ""}
              </section>` : ""}
            ${!this._selectedPlayer && this._teamRoster?.standing ? html`
              <section class="panel team-season-summary">
                <div class="panel-head"><h3>${this._t("SAISON RÉGULIÈRE")}</h3><span class="pill">${value(this._teamRoster.standing.rank, "—")} ${this._t("PLACE")}</span></div>
                <div class="team-standing-grid ${this._teamSelectedSeason === (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? "current" : "historical"}">
                  <div><small>${this._t("BILAN")}</small><strong>${value(this._teamRoster.standing.wins)}–${value(this._teamRoster.standing.losses)}</strong></div>
                  <div><small>${this._t("% VICTOIRES")}</small><strong>${value(this._teamRoster.standing.pct)}</strong></div>
                  <div><small>${this._t("RETARD")}</small><strong>${value(this._teamRoster.standing.gb)}</strong></div>
                  ${this._teamSelectedSeason === (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? html`<div><small>${this._t("SÉRIE")}</small><strong>${value(this._teamRoster.standing.streak)}</strong></div>` : ""}
                </div>
                ${this._teamRoster.schedule?.recent?.length ? html`<div class="muted" style="margin-top:12px">${this._t("FORME RÉCENTE")}</div><div class="recent">${this._teamRoster.schedule.recent.slice(0,5).map((game) => html`<button class="form-chip ${game.result === "V" ? "win" : game.result === "D" ? "loss" : "unknown"}" type="button" ?disabled=${!game.id} aria-label="Voir le match ${value(game.team_abbr)} contre ${value(game.opp_abbr)} du ${value(game.date_text)}" @click=${() => game.id && this._openRecentTeamGame(game)}><strong>${value(game.result)}</strong><span>${game.home_away === "@" ? `@${value(game.opp_abbr)}` : value(game.opp_abbr)}</span><span>${value(game.team_score)}–${value(game.opp_score)}</span></button>`)}</div>` : ""}
                ${this._teamRoster.schedule?.next ? html`<p class="muted">PROCHAIN MATCH · ${value(this._teamRoster.schedule.next.date_text)} · ${value(this._teamRoster.schedule.next.name)}</p>` : ""}
              </section>` : ""}
            ${!this._selectedPlayer && this._teamPlayoffPath ? html`
              <section class="panel team-playoff-history">
                <div class="panel-head"><h3>${this._t("PARCOURS EN PLAYOFFS")}</h3><span class="pill">${this._teamSelectedSeason - 1}-${String(this._teamSelectedSeason).slice(-2)}</span></div>
                <p class="muted">${value(this._teamPlayoffPath.result)}</p>
                ${!this._teamPlayoffPath.available ? html`<p class="muted">${this._t("Les données détaillées du parcours ne sont pas disponibles pour cette saison historique.")}</p>` : this._teamPlayoffPath.rounds?.length ? html`
                  <div class="team-playoff-path">
                    ${this._teamPlayoffPath.rounds.map((round, index) => html`
                      <div class="team-playoff-path-round">
                        <span class="team-playoff-path-number">${index + 1}</span>
                        <div><strong>${value(round.round_label)}</strong><div class="team-playoff-opponent">${round.opponent?.logo ? html`<img src=${round.opponent.logo} alt="" loading="lazy">` : ""}<span>${value(round.opponent?.name, round.opponent?.abbreviation)}</span></div></div>
                        <div class="team-playoff-path-score"><b>${value(round.wins, "—")}–${value(round.opponent_wins, "—")}</b></div>
                        <span class="team-playoff-path-status ${round.outcome === "win" ? "win" : round.outcome === "loss" ? "loss" : "live"}">${round.outcome === "win" ? this._t("TOUR SUIVANT") : round.outcome === "loss" ? this._t("FIN DU PARCOURS") : this._t("SÉRIE EN COURS")}</span>
                      </div>`)}
                  </div>` : html`<p class="muted">${this._t("Aucun parcours en playoffs enregistré pour cette saison.")}</p>`}
              </section>` : this._teamPlayoffLoading && !this._selectedPlayer ? html`<section class="panel team-playoff-history"><div class="panel-head"><h3>${this._t("PARCOURS EN PLAYOFFS")}</h3></div><p class="muted">${this._t("Chargement du parcours…")}</p></section>` : ""}
            <div class="panel-head"><h3>${this._selectedPlayer ? this._t("AUTRES JOUEURS") : this._t("EFFECTIF")}</h3><span class="pill">${this._teamRoster?.count ?? 0} ${this._t("JOUEURS")}</span></div>
            ${this._teamRosterLoading ? html`<section class="empty">${this._t("Chargement de l'effectif…")}</section>` : ""}
            ${this._teamRosterError ? html`<section class="empty"><strong>${this._t("Effectif indisponible")}</strong><p>${this._teamRosterError}</p><button @click=${() => this._openTeam(this._teamOverlay)}>${this._t("RÉESSAYER")}</button></section>` : ""}
            ${!this._teamRosterLoading && !this._teamRosterError && !players.length ? html`<section class="empty"><strong>${this._teamSelectedSeason !== (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? this._t("Effectif historique non proposé") : this._t("Effectif indisponible")}</strong><p>${this._teamSelectedSeason !== (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? this._t("NBA Center affiche uniquement l’effectif de la saison actuelle. Les bilans, classements et parcours en playoffs restent consultables pour les saisons précédentes.") : this._t("ESPN ne fournit pas de joueurs pour cette saison. Le bilan et le calendrier restent affichés lorsqu’ils sont disponibles.")}</p>${this._teamSelectedSeason === (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? html`<button @click=${() => this._openTeam(this._teamOverlay)}>${this._t("RÉESSAYER")}</button>` : ""}</section>` : ""}
            ${!this._teamRosterLoading && !this._teamRosterError && players.length ? html`
              <div class="roster-list">${players.map((player) => html`
                <button class="roster-player roster-player-button" type="button" @click=${() => this._selectRosterPlayer(player)}>
                  ${player.headshot ? html`<img class="roster-headshot" src=${player.headshot} alt="" loading="lazy">` : html`<div class="roster-headshot roster-placeholder"></div>`}
                  <div class="roster-player-info"><strong>${value(player.name)}</strong>
                    <small>${value(player.position)} · ${player.height_cm == null ? "—" : `${player.height_cm} cm`} · ${value(player.college, this._t("Université non renseignée"))}</small>
                    ${player.injuries?.length ? html`<small class="roster-injury">${player.injuries.map((injury) => value(injury.status)).filter(Boolean).join(" · ")}</small>` : ""}
                  </div>
                  <div class="roster-number"><strong>${player.jersey ? `#${player.jersey}` : "—"}</strong><small>${value(player.status)}</small></div>
                </button>`)}</div>` : ""}
            ${!this._teamRosterLoading && !this._teamRosterError && !players.length ? html`<section class="empty">${this._t("Aucun joueur retourné par ESPN.")}</section>` : ""}
          </div>
        </section>
      </div>`;
  }

  async _openPlayer(playerId, source = {}) {
    if (!playerId) return;
    const request = ++this._playerRequest;
    this._playerOverlay = { ...source, id: String(playerId), name: source.player ?? source.name ?? "Joueur NBA" };
    this._playerData = null; this._playerError = ""; this._playerLoading = true; this._playerSelectedSeason = ""; this._playerSelectedPlayoffSeason = ""; this._playerPlayoffLoading = false;
    try {
      const result = await this.hass.callWS({ type: "nba_center/player_data", player_id: String(playerId) });
      if (request !== this._playerRequest) return;
      this._playerData = result;
      // Le sélecteur playoffs est indépendant de celui de saison régulière.
      const playoffHistory = result.stats?.season_history ?? [];
      this._playerSelectedPlayoffSeason = String(playoffHistory[0]?.year ?? "");
      // Profil Core API v2 : une seule source biographique, quel que soit
      // le point d'entrée (classement, Match Center ou fiche équipe).
      if (result.bio && String(result.bio.id) === String(playerId)) {
        this._playerOverlay = { ...this._playerOverlay, ...result.bio,
          team: source.team ?? source.team_abbreviation ?? result.bio.team };
      }
    } catch (err) {
      if (request !== this._playerRequest) return;
      this._playerError = err?.message ?? "Données du joueur indisponibles.";
    } finally {
      if (request === this._playerRequest) this._playerLoading = false;
    }
  }

  async _loadPlayerPlayoffSeason(playerId, seasonYear) {
    if (!playerId || !Number.isInteger(seasonYear)) return;
    this._playerSelectedPlayoffSeason = String(seasonYear);
    this._playerPlayoffLoading = true;
    const playerRequest = this._playerRequest;
    const playoffRequest = ++this._playerPlayoffRequest;
    try {
      const result = await this.hass.callWS({ type: "nba_center/player_data", player_id: String(playerId), postseason_year: seasonYear });
      if (playerRequest !== this._playerRequest || playoffRequest !== this._playerPlayoffRequest || !this._playerOverlay) return;
      this._playerData = { ...this._playerData, postseason_stats: result.postseason_stats, postseason_gamelog: result.postseason_gamelog };
    } catch (err) {
      if (playerRequest === this._playerRequest && playoffRequest === this._playerPlayoffRequest) {
        this._playerError = err?.message ?? "Statistiques playoffs indisponibles.";
      }
    } finally {
      if (playerRequest === this._playerRequest && playoffRequest === this._playerPlayoffRequest) {
        this._playerPlayoffLoading = false;
      }
    }
  }

  _closePlayer() {
    this._playerRequest += 1;
    this._playerPlayoffRequest += 1;
    this._playerOverlay = null; this._expandedPlayerPhoto = null; this._playerData = null; this._playerLoading = false; this._playerError = "";
  }

  _playerProfilePanel() {
    const player = this._playerOverlay ?? {};
    const overview = this._playerData?.overview ?? {};
    const seasonHistory = this._playerData?.stats?.season_history ?? [];
    const selectedSeason = seasonHistory.find((item) => String(item.year) === String(this._playerSelectedSeason)) ?? seasonHistory[0];
    const stats = selectedSeason?.statistics ?? this._playerData?.stats?.statistics ?? [];
    const seasonLabel = selectedSeason?.display_name ?? this._playerData?.stats?.season ?? "SAISON";
    const postseason = this._playerData?.postseason_stats ?? {};
    const selectedPlayoffSeason = seasonHistory.find((item) => String(item.year) === String(this._playerSelectedPlayoffSeason)) ?? seasonHistory[0];
    const postseasonStats = postseason.statistics ?? [];
    const games = this._playerData?.gamelog?.games ?? [];
    const postseasonGames = this._playerData?.postseason_gamelog?.games ?? [];
    const teamCatalog = this._teamsCatalog().teams;
    const currentTeam = teamCatalog.find((team) =>
      (player.team_id != null && String(team.id) === String(player.team_id))
      || String(team.abbreviation ?? team.abbr ?? "").toUpperCase() === String(player.team_abbreviation ?? player.team ?? "").toUpperCase()
    );
    const seasonTeamLabel = (item) => {
      if (Array.isArray(item.teams) && item.teams.length > 1) {
        const abbreviations = item.teams.map((entry) => {
          const team = teamCatalog.find((candidate) =>
            (entry.team_id && String(candidate.id) === String(entry.team_id))
            || (entry.team_abbreviation && String(candidate.abbreviation).toUpperCase() === String(entry.team_abbreviation).toUpperCase())
          );
          return entry.team_abbreviation ?? team?.abbreviation ?? entry.team_name ?? team?.display_name ?? "";
        }).filter(Boolean);
        if (abbreviations.length) return [...new Set(abbreviations)].join(" · ");
      }
      const team = teamCatalog.find((candidate) =>
        (item.team_id && String(candidate.id) === String(item.team_id))
        || (item.team_abbreviation && String(candidate.abbreviation).toUpperCase() === String(item.team_abbreviation).toUpperCase())
      );
      return item.team_abbreviation ?? team?.abbreviation ?? item.team_name ?? team?.display_name ?? "";
    };
    const formatGameDate = (raw) => {
      const date = String(raw ?? "").split("T")[0];
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return match ? `${match[3]}/${match[2]}/${match[1]}` : (date || "—");
    };
    const translateStat = (item) => {
      const key = String(item.name ?? "").toLowerCase();
      const labels = { gamesplayed: "Matchs joués", gamesstarted: "Matchs comme titulaire",
        fieldgoalsmadeattemptedpergame: "Tirs réussis / tentés par match", fieldgoalpercentage: "Réussite aux tirs (%)",
        threepointfieldgoalsmadeattemptedpergame: "3 points réussis / tentés par match", threepointfieldgoalpercentage: "Réussite à 3 points (%)",
        freethrowsmadeattemptedpergame: "Lancers francs réussis / tentés par match", freethrowpercentage: "Réussite aux lancers francs (%)",
        offensivereboundspergame: "Rebonds offensifs par match", defensivereboundspergame: "Rebonds défensifs par match",
        foulspergame: "Fautes par match", turnoverpergame: "Balles perdues par match", turnoverspergame: "Balles perdues par match",
        offensiverebounds: "Rebonds offensifs", defensiverebounds: "Rebonds défensifs", turnovers: "Balles perdues",
        fouls: "Fautes", doubledouble: "Double-double", tripledouble: "Triple-double",
        disqualifications: "Disqualifications", ejections: "Expulsions", technicalfouls: "Fautes techniques",
        flagrantfouls: "Fautes flagrantes", assisttoturnoverratio: "Ratio passes / balles perdues",
        stealtoturnoverratio: "Ratio interceptions / balles perdues", scoringefficiency: "Efficacité offensive",
        shootingefficiency: "Efficacité au tir" };
      return labels[key] ? this._t(labels[key]) : (item.label ?? item.name);
    };
    const stat = (...names) => stats.find((item) => names.includes(String(item.name).toLowerCase()) || names.includes(String(item.label).toLowerCase()));
    // Les six indicateurs mis en évidence doivent être des moyennes par match.
    // Ne jamais retomber sur les totaux (points, rebounds, minutes, etc.).
    const quickDefinitions = [
      ["MIN", ["avgminutes", "minutespergame", "minutes per game"]],
      ["PTS", ["avgpoints", "pointspergame", "points per game"]],
      ["REB", ["avgrebounds", "reboundspergame", "rebounds per game"]],
      ["AST", ["avgassists", "assistspergame", "assists per game"]],
      ["STL", ["avgsteals", "stealspergame", "steals per game"]],
      ["BLK", ["avgblocks", "blockspergame", "blocks per game"]],
    ];
    const quick = quickDefinitions.map(([label, aliases]) => [label, stat(...aliases)]);
    const averageQuick = quick;
    const normalizeStatKey = (raw) => String(raw ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const statKeys = (item) => [
      item.name, item.label, item.display_name, item.abbreviation, item.shortDisplayName,
    ].map(normalizeStatKey).filter(Boolean);
    // Les six valeurs mises en évidence utilisent les mêmes lignes ESPN que
    // le tableau détaillé : l'identifiant "name" est la seule clé de sélection.
    const postseasonByName = Object.fromEntries(
      postseasonStats.map((item) => [String(item.name ?? ""), item])
    );
    const postseasonQuickDefinitions = [
      ["MIN", "avgMinutes"],
      ["PTS", "avgPoints"],
      ["REB", "avgRebounds"],
      ["AST", "avgAssists"],
      ["STL", "avgSteals"],
      ["BLK", "avgBlocks"],
    ];
    const postseasonQuick = postseasonQuickDefinitions.map(([label, id]) => {
      const item = postseasonByName[id];
      return [label, item ? (item.display_value ?? item.value ?? "—") : "—"];
    });
    const postseasonAverageQuick = postseasonQuick;
    const postseasonHighlighted = new Set(postseasonQuickDefinitions.map(([, id]) => normalizeStatKey(id)));
    const postseasonDetailOrder = [
      "gamesplayed", "gamesstarted", "fieldgoalsmade", "fieldgoalsattempted", "fieldgoalsmadeattempted",
      "fieldgoalpercentage", "threepointersmade", "threepointersattempted",
      "threepointfieldgoalsmade", "threepointfieldgoalsattempted", "threepointfieldgoalpercentage",
      "freethrowsmade", "freethrowsattempted", "freethrowpercentage",
      "offensiverebounds", "defensiverebounds", "rebounds",
      "assists", "steals", "blocks", "turnovers", "assisttoturnoverratio",
      "personalfouls", "fouls", "technicalfouls", "flagrantfouls",
      "doubledouble", "tripledouble", "disqualifications", "ejections",
    ];
    const postseasonDetailed = postseasonStats
      .filter((item) => !statKeys(item).some((key) => postseasonHighlighted.has(key)))
      .sort((a, b) => {
        const rank = (item) => {
          const key = String(item.name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const index = postseasonDetailOrder.indexOf(key);
          return index < 0 ? 1000 : index;
        };
        return rank(a) - rank(b) || String(a.label ?? a.name).localeCompare(String(b.label ?? b.name), "fr");
      });
    const highlightedNames = new Set(quickDefinitions.flatMap(([, aliases]) => aliases).map(normalizeStatKey));
    const regularDetailOrder = [
      "gamesplayed", "gamesstarted", "fieldgoalsmadeattemptedpergame", "fieldgoalsmade",
      "fieldgoalsattempted", "fieldgoalpercentage", "threepointfieldgoalsmadeattemptedpergame",
      "threepointersmade", "threepointersattempted", "threepointfieldgoalsmade",
      "threepointfieldgoalsattempted", "threepointfieldgoalpercentage",
      "freethrowsmadeattemptedpergame", "freethrowsmade", "freethrowsattempted",
      "freethrowpercentage", "offensivereboundspergame", "defensivereboundspergame",
      "offensiverebounds", "defensiverebounds", "rebounds", "assists",
      "steals", "blocks", "turnoverspergame", "turnoverpergame", "turnovers",
      "assisttoturnoverratio", "personalfouls", "foulspergame", "fouls",
      "technicalfouls", "flagrantfouls", "doubledouble", "tripledouble",
      "disqualifications", "ejections",
    ];
    const detailedStats = stats
      .filter((item) => !statKeys(item).some((key) => highlightedNames.has(key)))
      .sort((a, b) => {
        const rank = (item) => {
          const keys = statKeys(item);
          const index = regularDetailOrder.findIndex((key) => keys.includes(key));
          return index < 0 ? 1000 : index;
        };
        return rank(a) - rank(b)
          || String(a.label ?? a.name).localeCompare(String(b.label ?? b.name), "fr");
      });
    const statLabel = (item) => item?.display_value ?? (item?.value == null ? "—" : item.value);
    return html`<div class="overlay player-overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closePlayer(); }}>
      <section class="overlay-panel player-profile-overlay" role="dialog" aria-modal="true" aria-label="Profil joueur">
        <header class="overlay-head"><div class="team-roster-heading">${player.headshot ? html`<button class="player-photo-trigger" type="button" aria-label="Afficher la photo de ${value(player.name)} en grand" title="Afficher la photo en grand" @click=${() => { this._expandedPlayerPhoto = player.headshot; }}><img class="roster-headshot" src=${player.headshot} alt="Photo de ${value(player.name)}"></button>` : ""}${(currentTeam?.logo ?? player.team_logo) ? html`<img class="player-team-logo" src=${currentTeam?.logo ?? player.team_logo} alt="">` : ""}<div><h2>${value(overview.athlete?.name, player.name)}</h2><div class="muted">${[player.team, player.nationality, player.birth_place].filter(Boolean).join(" · ")}</div></div></div>
          <button class="overlay-close" aria-label="Fermer le profil joueur" @click=${() => this._closePlayer()}>✕</button></header>
        <div class="overlay-body">
          ${this._playerLoading ? html`<section class="empty">${this._t("Chargement des statistiques du joueur…")}</section>` : ""}
          ${this._playerError ? html`<section class="empty"><strong>${this._t("Profil détaillé indisponible")}</strong><p>${this._playerError}</p><button @click=${() => this._openPlayer(player.id, player)}>${this._t("RÉESSAYER")}</button></section>` : ""}
          ${this._playerData ? html`
            <section class="panel">
              <div class="panel-head"><h3>${this._t("FICHE JOUEUR &amp; BILAN CARRIÈRE")}</h3><span class="pill">CAREER</span></div>
              <div class="player-profile-grid">
                <div><small>${this._t("ÂGE")}</small><strong>${value(player.age)}</strong></div>
                <div><small>${this._t("POSTE")}</small><strong>${value(player.position_name, player.position)}</strong></div>
                <div><small>${this._t("TAILLE")}</small><strong>${player.height_cm == null ? value(player.height) : `${player.height_cm} cm`}</strong></div>
                <div><small>${this._t("POIDS")}</small><strong>${player.weight_kg == null ? value(player.weight) : `${player.weight_kg.toLocaleString("fr-BE")} kg`}</strong></div>
                <div><small>${this._t("EXPÉRIENCE NBA")}</small><strong>${player.experience_years == null ? "—" : `${player.experience_years} ${this._t("ans")}`}${(() => { const gp = overview.career_statistics?.find((row) => row.name === "gamesPlayed"); return gp ? html` / ${value(gp.display_value, gp.value)} m` : ""; })()}</strong></div>
                <div><small>N°</small><strong>${value(player.jersey)}</strong></div>
                <div><small>DRAFT NBA</small><strong>${value(player.draft)}</strong></div>
                <div><small>${this._t("STATUT")}</small><strong>${value(player.status)}</strong></div>
                <div><small>${this._t("ÉTAT MÉDICAL")}</small><strong class="roster-injury">${player.injuries?.length ? player.injuries.map((injury) => value(injury.status)).filter(Boolean).join(" · ") : this._t("Non renseigné")}</strong></div>
              </div>
              ${overview.career_statistics?.length ? html`
                <div class="panel-head" style="margin-top:16px"><h3>${this._t("MOYENNES EN CARRIÈRE")}</h3></div>
                <div class="player-stat-grid">${["avgMinutes","avgPoints","avgRebounds","avgAssists","avgBlocks","avgSteals"].map((name) => {
                  const item = overview.career_statistics.find((row) => row.name === name);
                  return item ? html`<div><small>${value(item.label,item.name)}</small><strong>${value(item.display_value,item.value)}</strong></div>` : "";
                })}</div>` : ""}
            </section>
            ${games.length ? html`
              <section class="panel player-gamelog"><div class="panel-head"><h3>${this._t("5 DERNIERS MATCHS")}</h3></div>
                ${games.slice(0,5).some((game) => Object.keys(game.stats ?? {}).length) ? html`<div class="player-game-list">
                  <div class="player-game-row player-game-header"><span>${this._t("DATE")}</span><span>${this._t("ADV.")}</span>${["MIN","PTS","REB","AST","STL","BLK"].map((label) => html`<span>${label}</span>`)}</div>
                  ${games.slice(0,5).map((game) => {
                    const stats = game.stats ?? {};
                    const pick = (...keys) => {
                      const key = keys.find((candidate) => stats[candidate] !== undefined && stats[candidate] !== null && stats[candidate] !== "");
                      return key ? stats[key] : "—";
                    };
                    const didNotPlay = game.did_not_play === true;
                    const labels = [["MIN",pick("MIN","minutes")],["PTS",pick("PTS","points")],["REB",pick("REB","rebounds")],["AST",pick("AST","assists")],["STL",pick("STL","steals")],["BLK",pick("BLK","blocks")]];
                    return html`<button class="player-game-row player-game-row-button" type="button" ?disabled=${!game.id} aria-label="Voir le match du ${formatGameDate(game.date)} contre ${value(game.opponent_abbreviation, value(game.opponent))}" @click=${() => this._openPlayerRecentGame(game)}><strong class="player-game-date">${formatGameDate(game.date)}</strong><span class="player-game-opponent">${game.home_away === "@" ? "@" : "vs"} ${value(game.opponent_abbreviation, value(game.opponent))}${didNotPlay ? " DNP" : ""}</span>${labels.map(([label,val]) => html`<span class="player-game-cell">${didNotPlay ? "—" : val}</span>`)}</button>`;
                  })}</div>` : html`<p class="muted">${this._t("Les box scores individuels ne sont pas encore disponibles pour ces rencontres.")}</p>`}
              </section>` : ""}
            <section class="panel player-season-panel"><div class="panel-head"><h3>${this._t("STATISTIQUES DE SAISON")}</h3><span class="pill">${value(seasonLabel, "SAISON")}</span></div>
              ${seasonHistory.length > 1 ? html`<div class="filters player-season-picker"><label class="muted" for="player-season-select">${this._t("SAISON")}</label><select id="player-season-select" aria-label="Choisir une saison" .value=${String(selectedSeason?.year ?? "")} @change=${(event) => { this._playerSelectedSeason = event.target.value; this.requestUpdate(); }}>${seasonHistory.map((item) => html`<option value=${String(item.year)}>${item.display_name}${seasonTeamLabel(item) ? ` · ${seasonTeamLabel(item)}` : ""}</option>`)}</select></div>` : ""}
            <div class="player-stat-grid player-season-highlights">${averageQuick.map(([label,item]) => html`<div><small>${label} / MATCH</small><strong>${statLabel(item)}</strong></div>`)}</div>
              ${stats.length ? html`<div class="table-wrap"><table><thead><tr><th>${this._t("STATISTIQUE")}</th><th>${this._t("VALEUR")}</th></tr></thead><tbody>${detailedStats.map((item) => html`<tr><td>${value(translateStat(item),item.name)}</td><td>${value(item.display_value ?? item.value)}</td></tr>`)}</tbody></table></div>` : html`<p class="muted">${this._t("Aucune autre statistique disponible pour cette saison.")}</p>`}
            </section>
            <section class="panel player-postseason-panel">
              <div class="panel-head"><h3>${this._t("STATISTIQUES PLAYOFFS")}</h3><span class="pill">${value(postseason.season, selectedPlayoffSeason?.display_name ?? "POSTSEASON")}</span></div>
              <p class="muted">${this._t("Moyennes fournies par ESPN Web API v3. On les affiche directement, sans recalcul local.")}</p>
              ${seasonHistory.length ? html`<div class="filters player-season-picker"><label class="muted" for="player-playoff-season-select">${this._t("SAISON PLAYOFFS")}</label><select id="player-playoff-season-select" aria-label="Choisir la saison des playoffs" .value=${String(this._playerSelectedPlayoffSeason || seasonHistory[0]?.year || "")} @change=${(event) => this._loadPlayerPlayoffSeason(player.id, Number(event.target.value))}>${seasonHistory.map((item) => html`<option value=${String(item.year)}>${item.display_name}${seasonTeamLabel(item) ? ` · ${seasonTeamLabel(item)}` : ""}</option>`)}</select>${this._playerPlayoffLoading ? html`<span class="muted">${this._t("Chargement…")}</span>` : ""}</div>` : ""}
              ${postseasonStats.length ? html`
                <div class="player-stat-grid player-season-highlights">${postseasonAverageQuick.map(([label,item]) => html`<div><small>${label} / MATCH</small><strong>${value(item)}</strong></div>`)}</div>
                ${postseasonDetailed.length ? html`<div class="table-wrap"><table><thead><tr><th>${this._t("STATISTIQUE")}</th><th>${this._t("VALEUR")}</th></tr></thead><tbody>${postseasonDetailed.map((item) => html`<tr><td>${value(translateStat(item),item.name)}</td><td>${value(item.display_value ?? item.value)}</td></tr>`)}</tbody></table></div>` : ""}
              ` : html`<p class="muted">Les statistiques des playoffs sont récupérées séparément. Elles apparaîtront ici dès qu'ESPN publiera les données de postseason pour cette saison.</p>`}
            </section>
            ${Object.keys(this._playerData.errors ?? {}).length ? html`<p class="muted">Certaines sources ESPN sont indisponibles : ${Object.keys(this._playerData.errors).join(" · ")}</p>` : ""}
          ` : ""}
        </div>
      </section>
      ${this._expandedPlayerPhoto ? html`<div class="player-photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo du joueur en grand" @click=${() => { this._expandedPlayerPhoto = null; }}>
        <button type="button" aria-label="Fermer la photo" @click=${() => { this._expandedPlayerPhoto = null; }}>✕</button>
        <img src=${this._expandedPlayerPhoto} alt="Photo de ${value(player.name)}" @click=${(event) => event.stopPropagation()} />
      </div>` : ""}
    </div>`;
  }

  _selectRosterPlayer(player) {
    this._selectedPlayer = player;
    this._openPlayer(player.id, { ...player, player: player.name, team_id: this._teamOverlay?.id, team_abbreviation: this._teamOverlay?.abbreviation ?? this._teamOverlay?.abbr, team_logo: this._teamOverlay?.logo, team: this._teamOverlay?.abbreviation ?? this._teamOverlay?.abbr ?? this._teamOverlay?.name });
    this.requestUpdate();
    this.updateComplete.then(() => {
      const body = this.renderRoot?.querySelector(".team-roster-overlay .overlay-body");
      body?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  _setTeamSearch(event) { this._teamSearch = event.target.value ?? ""; }
  _setTeamConference(value) { this._teamConference = value; }

  _selectView(view) {
    this._active = view;
    if (view === "stats") this._loadStandingsView();
    if (view === "players") this._loadPlayerLeaders();
    if (view === "scores") {
      if (!this._calendarInitialized) { this._selectedDate = localDateISO(new Date(), this.hass?.config?.time_zone); this._calendarInitialized = true; }
      this._loadCalendar(this._selectedDate);
    }
  }
  _setFilter(filter) { this._filter = filter; }
  _setStandingsSeason(event) {
    const year = Number(event.target.value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return;
    this._standingSeason = year;
    this._playoffSeason = year;
    this._loadStandingsView();
  }
  _setStandingsPhase(phase) {
    if (!["regular", "playoffs"].includes(phase) || phase === this._standingPhase) return;
    this._standingPhase = phase;
    // Les classements réguliers sont disponibles depuis 2002-03,
    // mais les playoffs ne sont exploitables qu'à partir de 2007-08.
    if (phase === "playoffs" && this._standingSeason < 2008) {
      this._standingSeason = 2008;
      this._playoffSeason = 2008;
    }
    if (phase === "playoffs") this._loadPlayoffBracket(this._standingSeason);
    else this._loadHistoricalStandings(this._standingSeason);
  }
  _loadStandingsView() {
    if (this._standingPhase === "playoffs") this._loadPlayoffBracket(this._standingSeason);
    else this._loadHistoricalStandings(this._standingSeason);
  }
  async _loadHistoricalStandings(year = this._standingSeason) {
    if (!this.hass?.callWS || !Number.isInteger(year)) return;
    const request = ++this._seasonStandingsRequest;
    const cached = this._standingsResultsCache.get(year);
    const cacheTtl = year === (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? 5 * 60 * 1000 : 7 * 86400 * 1000;
    if (cached && Date.now() - cached.at < cacheTtl) {
      this._seasonStandings = cached.data;
      this._seasonStandingsLoading = false;
      this._seasonStandingsError = "";
      return;
    }
    this._seasonStandingsLoading = true;
    this._seasonStandingsError = "";
    this._seasonStandings = null;
    try {
      const result = await this.hass.callWS({ type: "nba_center/standings", season_year: year });
      if (request !== this._seasonStandingsRequest || year !== this._standingSeason) return;
      this._standingsResultsCache.set(year, { at: Date.now(), data: result });
      this._seasonStandings = result;
    } catch (err) {
      if (request !== this._seasonStandingsRequest) return;
      this._seasonStandingsError = err?.message ?? "Impossible de charger le classement de cette saison.";
    } finally {
      if (request === this._seasonStandingsRequest) this._seasonStandingsLoading = false;
    }
  }
  async _loadPlayoffBracket(year = this._playoffSeason) {
    if (!this.hass?.callWS || !Number.isInteger(year)) return;
    const request = ++this._playoffRequest;
    const cached = this._playoffResultsCache.get(year);
    const currentSeason = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    const cacheTtl = year === currentSeason ? 15 * 60 * 1000 : 7 * 86400 * 1000;
    if (cached && Date.now() - cached.at < cacheTtl) {
      this._playoffData = cached.data;
      this._playoffLoading = false;
      this._playoffError = "";
      return;
    }
    this._playoffLoading = true; this._playoffError = ""; this._playoffData = null;
    try {
      const result = await this.hass.callWS({ type: "nba_center/playoff_bracket", season_year: year });
      if (request !== this._playoffRequest || year !== this._playoffSeason) return;
      this._playoffResultsCache.set(year, { at: Date.now(), data: result });
      this._playoffData = result;
    } catch (err) {
      if (request !== this._playoffRequest) return;
      this._playoffError = err?.message ?? "Impossible de charger le tableau des playoffs.";
    } finally {
      if (request === this._playoffRequest) this._playoffLoading = false;
    }
  }
  _openPlayoffSeries(series) { this._seriesOverlay = series; }
  _closePlayoffSeries() { this._seriesOverlay = null; }
  _playoffSeriesCard(series) {
    const teams = series.teams ?? [];
    const winnerId = series.winner?.id == null ? null : String(series.winner.id);
    const catalog = this._teamsCatalog().teams;
    const status = series.status === "completed" ? this._t("TERMINÉE") : series.status === "inconsistent" ? this._t("À VÉRIFIER") : this._t("EN COURS");
    return html`<button type="button" class="playoff-series playoff-series-button" @click=${() => this._openPlayoffSeries(series)} aria-label=${`${this._t("Voir les matchs de la série")} ${teams.map((team) => team.abbreviation ?? team.name).join(" vs ")}`}>
      <div class="playoff-series-top"><span class="playoff-series-round">${value(series.round_label, this._t("SÉRIE"))}</span><span class="pill">${status}</span></div>
      ${teams.map((team) => {
        const club = catalog.find((candidate) => String(candidate.id) === String(team.id));
        return html`<div class="playoff-team ${winnerId === String(team.id) ? "playoff-winner" : ""}">
          <span class="playoff-seed">${team.seed == null ? "—" : `#${team.seed}`}</span>
          ${club?.logo ? html`<img class="playoff-team-logo" src=${club.logo} alt="" loading="lazy">` : ""}
          <strong>${value(team.abbreviation, team.name ?? team.id)}</strong>
          <span class="playoff-wins">${Number.isInteger(team.wins) ? `${series.unknown_results ? "≥" : ""}${team.wins}` : "—"}</span>
        </div>`;
      })}
      <div class="playoff-series-bottom"><span>${series.completed_games ?? 0} / ${series.games_played ?? 0} ${this._t("MATCHS TERMINÉS")}</span><strong>${this._t("VOIR LES MATCHS")} <span aria-hidden="true">›</span></strong></div>
      ${series.unknown_results ? html`<div class="playoff-warning">${series.unknown_results} ${this._t("résultat(s) non confirmé(s)")}</div>` : ""}
      ${series.issues?.length ? html`<div class="playoff-warning">${this._t("Données incohérentes")} : ${series.issues.join(", ")}</div>` : ""}
    </button>`;
  }
  _playoffSeriesOverlay() {
    const series = this._seriesOverlay;
    if (!series) return "";
    const catalog = this._teamsCatalog().teams;
    const teams = series.teams ?? [];
    const games = [...(series.games ?? [])].sort((a, b) => (a.game_number ?? 99) - (b.game_number ?? 99) || String(a.date ?? "").localeCompare(String(b.date ?? "")));
    const teamFor = (game, side) => (game.teams ?? []).find((team) => team.home_away === side) ?? {};
    const clubFor = (team) => catalog.find((club) => String(club.id) === String(team.id));
    return html`<div class="overlay playoff-series-overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closePlayoffSeries(); }}>
      <section class="overlay-panel" role="dialog" aria-modal="true" aria-label=${this._t("Matchs de la série")}>
        <header class="overlay-head"><div><div class="section-kicker">${value(series.round_label, "PLAYOFFS")}</div><h2>${teams.map((team) => value(team.abbreviation, team.name)).join(" · ")}</h2></div><button class="overlay-close" aria-label="Fermer la série" @click=${this._closePlayoffSeries}>✕</button></header>
        <div class="overlay-body">
          <div class="playoff-series-detail-summary"><span class="pill">${series.status === "completed" ? this._t("SÉRIE TERMINÉE") : series.status === "inconsistent" ? this._t("DONNÉES À VÉRIFIER") : this._t("SÉRIE EN COURS")}</span><strong>${teams.map((team) => Number.isInteger(team.wins) ? team.wins : "—").join(" – ")}</strong><span class="muted">${series.completed_games ?? 0} ${this._t("matchs terminés")} · ${series.games_played ?? 0} ${this._t("recensés")}</span></div>
          <div class="playoff-game-list">
            ${games.length ? games.map((game) => {
              const away = teamFor(game, "away");
              const home = teamFor(game, "home");
              const awayClub = clubFor(away);
              const homeClub = clubFor(home);
              const completed = game.completed === true;
              const declaredWinners = (game.teams ?? []).filter((team) => team.winner === true);
              const scoreWinner = completed && Number.isFinite(Number(away.score)) && Number.isFinite(Number(home.score)) && Number(away.score) !== Number(home.score)
                ? (Number(away.score) > Number(home.score) ? "away" : "home") : null;
              const winnerSide = declaredWinners.length === 1
                ? (String(declaredWinners[0].id) === String(away.id) ? "away" : String(declaredWinners[0].id) === String(home.id) ? "home" : null)
                : scoreWinner;
              const gameLabel = game.game_number ? `GAME ${game.game_number}` : this._t("MATCH");
              const date = game.date ? new Date(game.date).toLocaleDateString(this.hass?.locale?.language ?? this.hass?.language ?? "fr-BE", { day: "2-digit", month: "short", year: "numeric" }) : "Date indisponible";
              return html`<button type="button" class="playoff-game-row ${winnerSide === "away" ? "winner-away" : winnerSide === "home" ? "winner-home" : ""}" ?disabled=${!game.id} @click=${() => {
                if (!game.id) return;
                this._closePlayoffSeries();
                this._openGame({
                  id: game.id, date_text: date, state: completed ? "post" : "pre",
                  detail: completed ? this._t("TERMINÉ") : this._t("À VENIR"),
                  away: { id: away.id, name: away.name ?? awayClub?.display_name ?? awayClub?.name, abbr: away.abbreviation, logo: awayClub?.logo, score: away.score },
                  home: { id: home.id, name: home.name ?? homeClub?.display_name ?? homeClub?.name, abbr: home.abbreviation, logo: homeClub?.logo, score: home.score },
                });
              }}>
                <span class="playoff-game-number">${gameLabel}<small>${date}</small></span>
                <span class="playoff-game-team">${awayClub?.logo ? html`<img src=${awayClub.logo} alt="" loading="lazy">` : ""}<strong>${value(away.abbreviation, away.name)}</strong><b>${completed ? value(away.score) : "—"}</b>${winnerSide === "away" ? html`<small class="playoff-winner-label">${this._t("GAGNANT")}</small>` : ""}</span>
                <span class="playoff-game-team">${homeClub?.logo ? html`<img src=${homeClub.logo} alt="" loading="lazy">` : ""}<strong>${value(home.abbreviation, home.name)}</strong><b>${completed ? value(home.score) : "—"}</b>${winnerSide === "home" ? html`<small class="playoff-winner-label">${this._t("GAGNANT")}</small>` : ""}</span>
                <span class="playoff-game-open" aria-hidden="true">›</span>
              </button>`;
            }) : html`<section class="empty"><p>${this._t("Les rencontres détaillées de cette série ne sont pas disponibles dans les données ESPN reçues.")}</p></section>`}
          </div>
        </div>
      </section>
    </div>`;
  }
  _playoffRound(round) {
    return html`<section class="playoff-round"><div class="section-kicker">${value(round.round_label)}</div><div class="grid">${(round.series ?? []).map((series) => this._playoffSeriesCard(series))}</div></section>`;
  }
  _playoffsView() {
    const data = this._playoffData;
    return html`<div class="section-kicker">${this._t("TABLEAU DES PLAYOFFS")} · ${this._standingSeason - 1}-${String(this._standingSeason).slice(-2)}</div>
      ${this._playoffLoading ? html`<section class="empty">${this._t("Chargement du tableau")} ${this._playoffSeason - 1}-${String(this._playoffSeason).slice(-2)}…</section>` : ""}
      ${this._playoffError ? html`<section class="empty"><strong>${this._t("Tableau indisponible")}</strong><p>${this._playoffError}</p><button @click=${() => this._loadPlayoffBracket()}>${this._t("RÉESSAYER")}</button></section>` : ""}
      ${!this._playoffLoading && data ? html`<div class="playoff-summary"><span>${data.games_count ?? 0} ${this._t("MATCHS")}</span><span>${data.series_count ?? 0} ${this._t("SÉRIES")}</span><span>${data.available ? this._t("DONNÉES REÇUES") : this._t("AUCUN MATCH PLAYOFF")}</span></div>
        ${Object.entries(data.conferences ?? {}).map(([conference, rounds]) => html`<section class="playoff-conference"><div class="playoff-conference-title"><h2>${conference.toUpperCase()}ERN CONFERENCE</h2><span class="pill">${(rounds ?? []).reduce((n, round) => n + (round.series?.length ?? 0), 0)} SÉRIES</span></div>${(rounds ?? []).length ? rounds.map((round) => this._playoffRound(round)) : html`<section class="empty"><strong>Tableau ${conference} indisponible</strong><p>${this._t("Les données ESPN ne permettent pas de reconstituer les séries de cette conférence.")}</p></section>`}</section>`)}
        <section class="playoff-conference"><div class="playoff-conference-title"><h2>NBA FINALS</h2></div>${(data.finals ?? []).length ? html`<div class="grid">${data.finals.map((series) => this._playoffSeriesCard(series))}</div>` : html`<section class="empty"><strong>${this._t("Finales NBA non disponibles")}</strong><p>${this._t("Aucune série des Finales n'a été identifiée pour cette saison.")}</p></section>`}</section>
        ${(data.unplaced ?? []).length ? html`<section class="playoff-conference"><div class="playoff-conference-title"><h2>${this._t("SÉRIES NON CLASSÉES")}</h2></div><div class="grid">${data.unplaced.map((series) => this._playoffSeriesCard(series))}</div></section>` : ""}
        ${Object.keys(data.seed_errors ?? {}).length ? html`<section class="empty playoff-warning"><strong>${this._t("Têtes de série non validées")}</strong><p>${Object.entries(data.seed_errors).map(([conference, errors]) => `${conference} : ${errors.join(", ")}`).join(" · ")}</p>${this._t("Les positions de tableau ne sont pas inventées.")}</section>` : ""}
        ${Object.keys(data.schedule_errors ?? {}).length ? html`<p class="muted">Calendriers manquants pour ${Object.keys(data.schedule_errors).length} ${this._t("équipe(s)")} · ${this._t("certaines séries peuvent être incomplètes.")}</p>` : ""}
      ` : ""}
      ${!this._playoffLoading && !this._playoffError && !data ? html`<section class="empty"><strong>${this._t("Aucune donnée chargée")}</strong><p>${this._t("Choisis une saison pour charger son tableau.")}</p><button @click=${() => this._loadPlayoffBracket()}>${this._t("CHARGER LES PLAYOFFS")}</button></section>` : ""}`;
  }
  _setSearch(event) { this._search = event.target.value ?? ""; }
  _shiftDate(days) { this._selectedDate = shiftDateISO(this._selectedDate, days); this._loadCalendar(this._selectedDate); }
  _setDate(event) { this._selectedDate = event.target.value; this._loadCalendar(this._selectedDate); }
  async _loadCalendar(date) {
    if (!this.hass?.callWS || !date) return;
    const request = ++this._calendarRequest;
    this._calendarLoading = true; this._calendarError = ""; this._calendarStale = false; this._calendarStaleError = "";
    try {
      const result = await this.hass.callWS({ type: "nba_center/scoreboard", date });
      if (request !== this._calendarRequest || date !== this._selectedDate) return;
      this._calendarGames = result.games ?? [];
      this._calendarStale = Boolean(result.stale);
      this._calendarStaleError = result.error ?? "";
    } catch (err) {
      if (request !== this._calendarRequest || date !== this._selectedDate) return;
      this._calendarError = err?.message ?? "Impossible de charger le calendrier NBA.";
      this._calendarGames = [];
    } finally {
      if (request === this._calendarRequest) this._calendarLoading = false;
    }
  }
  _openPlayerRecentGame(game) {
    if (!game?.id) return;
    // Fermer la fiche joueur avant d'ouvrir le Match Center depuis son historique.
    this._closePlayer();
    const teamAbbr = game.team ?? this._selectedPlayer?.team_abbreviation ?? this._selectedPlayer?.team ?? "";
    const opponentAbbr = game.opponent_abbreviation ?? "";
    const team = this._teamsCatalog().teams.find((item) =>
      String(item.abbreviation ?? item.abbr ?? "").toUpperCase() === String(teamAbbr).toUpperCase()
    );
    const opponent = this._teamsCatalog().teams.find((item) =>
      String(item.abbreviation ?? item.abbr ?? "").toUpperCase() === String(opponentAbbr).toUpperCase()
    );
    this._openRecentTeamGame({
      id: game.id,
      date_text: game.date ? new Date(game.date).toLocaleDateString("fr-BE") : "Date indisponible",
      team_abbr: teamAbbr,
      opp_abbr: opponentAbbr,
      opp_name: game.opponent,
      home_away: game.home_away === "@" ? "@" : "vs",
      team_score: null,
      opp_score: null,
      team_logo: team?.logo,
      opp_logo: opponent?.logo,
    });
  }
  _openRecentTeamGame(game) {
    // Navigation à écran unique : fermer la fiche équipe avant le Match Center.
    this._closeTeamOverlay();
    const currentTeam = {
      name: this._teamOverlay?.display_name ?? this._teamOverlay?.name ?? game.team_abbr,
      abbr: game.team_abbr,
      logo: this._teamOverlay?.logo,
      score: game.team_score,
    };
    const opponent = {
      name: game.opp_name ?? game.opp_abbr,
      abbr: game.opp_abbr,
      logo: game.opp_logo,
      score: game.opp_score,
    };
    const currentTeamIsAway = game.home_away === "@";
    this._openGame({
      id: game.id,
      date_text: game.date_text,
      state: "post",
      detail: "TERMINÉ",
      away: currentTeamIsAway ? currentTeam : opponent,
      home: currentTeamIsAway ? opponent : currentTeam,
    });
  }
  _openMatchTeam(team) {
    if (!team) return;
    // Navigation à écran unique : fermer le Match Center avant la fiche équipe.
    this._closeOverlay();
    const catalog = this._teamsCatalog().teams;
    const catalogTeam = catalog.find((candidate) =>
      (team.id != null && String(candidate.id) === String(team.id))
      || String(candidate.abbreviation ?? candidate.abbr ?? "").toUpperCase() === String(team.abbr ?? team.abbreviation ?? "").toUpperCase()
    );
    const selectedTeam = catalogTeam
      ? { ...catalogTeam, ...team, id: catalogTeam.id, name: team.name ?? catalogTeam.display_name ?? catalogTeam.name, logo: team.logo ?? catalogTeam.logo }
      : team;
    if (selectedTeam.id == null) return;
    this._openTeam(selectedTeam);
  }

  async _openGame(game) {
    this._stopOverlayAutoRefresh();
    const request = ++this._overlayRequest;
    this._overlayGame = game; this._overlayDetails = null; this._overlayError = ""; this._overlayLoading = true;
    this._showAllPlays = false; this._scoringOnly = false;
    try {
      const details = await this.hass.callWS({ type: "nba_center/game_details", game_id: String(game.id) });
      if (request !== this._overlayRequest || String(this._overlayGame?.id) !== String(game.id)) return;
      this._overlayDetails = details;
      this._syncOverlayGame(details);
    } catch (err) {
      if (request !== this._overlayRequest) return;
      this._overlayError = err?.message ?? "Résumé du match indisponible.";
    } finally {
      if (request === this._overlayRequest) {
        this._overlayLoading = false;
        if (this._overlayGame?.state === "in") this._startOverlayAutoRefresh();
      }
    }
  }

  _syncOverlayGame(details) {
    const competitors = details?.live_state?.competitors ?? [];
    if (competitors.length < 2 || !this._overlayGame) return;
    const catalog = this._teamsCatalog().teams;
    const toTeam = (competitor) => {
      const catalogTeam = catalog.find((team) =>
        (competitor.team_id && String(team.id) === String(competitor.team_id))
        || String(team.abbreviation ?? team.abbr ?? "").toUpperCase() === String(competitor.abbr ?? "").toUpperCase()
      );
      return {
        id: competitor.team_id,
        name: competitor.name ?? catalogTeam?.display_name ?? catalogTeam?.name ?? competitor.abbr,
        abbr: competitor.abbr ?? catalogTeam?.abbreviation,
        logo: catalogTeam?.logo,
        score: competitor.score,
      };
    };
    const away = competitors.find((team) => team.home_away === "away");
    const home = competitors.find((team) => team.home_away === "home");
    if (!away || !home) return;
    const liveState = details.live_state.state;
    this._overlayGame = {
      ...this._overlayGame,
      state: liveState === "pre" ? "pre" : liveState === "in" ? "in" : "post",
      detail: details.live_state.status_detail ?? this._overlayGame.detail,
      away: toTeam(away),
      home: toTeam(home),
    };
  }

  _startOverlayAutoRefresh() {
    if (this._overlayRefreshTimer || !this.isConnected || this._overlayGame?.state !== "in") return;
    this._overlayRefreshTimer = setInterval(() => {
      if (!this.isConnected || !this._overlayGame || this._overlayGame.state !== "in") {
        this._stopOverlayAutoRefresh();
        return;
      }
      this._refreshGameDetails();
    }, 15000);
  }

  _stopOverlayAutoRefresh() {
    if (this._overlayRefreshTimer) clearInterval(this._overlayRefreshTimer);
    this._overlayRefreshTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._overlayGame?.state === "in") this._startOverlayAutoRefresh();
  }

  disconnectedCallback() {
    this._stopOverlayAutoRefresh();
    super.disconnectedCallback();
  }

  async _refreshGameDetails() {
    const gameId = this._overlayGame?.id;
    if (!gameId || this._overlayLoading) return;
    const request = ++this._overlayRequest;
    this._overlayLoading = true;
    this._overlayError = "";
    try {
      const details = await this.hass.callWS({ type: "nba_center/game_details", game_id: String(gameId), force: true });
      if (request !== this._overlayRequest || String(this._overlayGame?.id) !== String(gameId)) return;
      this._overlayDetails = details;
      this._syncOverlayGame(details);
      if (this._overlayGame?.state !== "in") this._stopOverlayAutoRefresh();
    } catch (err) {
      if (request === this._overlayRequest) this._overlayError = err?.message ?? "Actualisation du match impossible.";
    } finally {
      if (request === this._overlayRequest) this._overlayLoading = false;
    }
  }

  _closeOverlay() {
    this._stopOverlayAutoRefresh();
    this._overlayRequest += 1;
    this._overlayGame = null; this._overlayDetails = null; this._overlayLoading = false; this._overlayError = "";
  }
  _onOverlayKeydown(event) { if (event.key === "Escape") this._closeOverlay(); }

  _boxscorePanel(block) {
    const players = block.players ?? [];
    const preferred = ["MIN", "PTS", "FG", "3PT", "FT", "OREB", "DREB", "REB", "AST", "STL", "BLK", "TO", "PF", "+/-"];
    const available = new Set(players.flatMap((player) => Object.keys(player.stats ?? {})));
    const columns = [...preferred.filter((key) => available.has(key)), ...[...available].filter((key) => !preferred.includes(key))];
    const rows = [...players].sort((a, b) => Number(Boolean(b.starter)) - Number(Boolean(a.starter)));
    const team = this._teamsCatalog().teams.find((item) => String(item.id) === String(block.team_id));
    return html`
      <section class="panel boxscore-panel">
        <div class="panel-head"><h3>${value(block.abbr, block.team)}</h3><span class="pill">${players.length} JOUEURS</span></div>
        ${rows.length ? html`<div class="table-wrap player-table-wrap"><table class="player-table">
          <thead><tr><th>${this._t("JOUEUR")}</th>${columns.map((key) => html`<th>${key}</th>`)}</tr></thead>
          <tbody>${rows.map((player) => html`
            <tr class="${player.starter ? "starter" : ""} ${player.did_not_play ? "dnp" : ""}">
              <td><span class="player-cell">${player.headshot ? html`<img src=${player.headshot} alt="" loading="lazy">` : ""}<span>${player.id ? html`<button type="button" class="boxscore-player-link" aria-label="Ouvrir le profil de ${value(player.name)}" @click=${() => this._openPlayer(player.id, { ...player, player: player.name, team_id: block.team_id, team_abbreviation: block.abbr, team: block.abbr ?? block.team, team_logo: team?.logo })}>${value(player.name)}</button>` : html`<strong>${value(player.name)}</strong>`}<small>${[player.jersey ? `#${player.jersey}` : "", player.position || "", player.ejected ? "ÉJECTÉ" : player.did_not_play ? `DNP · ${value(player.reason, "NON PRIS EN JEU")}` : player.starter ? "TITULAIRE" : player.active ? "ACTIF" : ""].filter(Boolean).join(" · ")}</small></span></span></td>
              ${columns.map((key) => html`<td>${value(player.stats?.[key])}</td>`)}
            </tr>`)}
          </tbody>
        </table></div>` : html`<p class="muted">${this._t("Statistiques individuelles indisponibles.")}</p>`}
      </section>`;
  }

  _awayFirst(items, homeAwayFor = (item) => item.home_away) {
    return [...(items ?? [])].sort((a, b) => {
      const rank = (item) => homeAwayFor(item) === "away" ? 0 : 1;
      return rank(a) - rank(b);
    });
  }

  _quarterScorePanel() {
    const teams = this._awayFirst(this._overlayDetails?.teams);
    const periods = Math.max(0, ...teams.map((team) => team.quarters?.length ?? 0));
    if (!periods || !teams.length) return "";
    const labels = Array.from({ length: periods }, (_, index) =>
      index < 4 ? `Q${index + 1}` : index === 4 ? "OT" : `${index - 4 + 1}OT`
    );
    return html`
      <section class="panel quarter-score-panel">
        <div class="panel-head"><h3>${this._t("SCORE PAR PÉRIODE")}</h3><span class="pill">${periods > 4 ? this._t("PROLONGATION") : this._t("TEMPS RÉGLEMENTAIRE")}</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>${this._t("ÉQUIPE")}</th>${labels.map((label) => html`<th>${label}</th>`)}<th>${this._t("TOTAL")}</th></tr></thead>
          <tbody>${teams.map((team) => html`
            <tr><td>${value(team.abbr, team.name)}</td>
              ${labels.map((_, index) => html`<td>${value(team.quarters?.[index])}</td>`)}
              <td>${value(team.score)}</td>
            </tr>`)}</tbody>
        </table></div>
      </section>`;
  }

  _teamStatsPanel() {
    const teams = this._awayFirst(this._overlayDetails?.team_stats);
    if (!teams.length) return "";
    const sourceKeys = [...new Set(teams.flatMap((team) => (team.statistics ?? []).map((stat) => stat.name)))];
    const statPriority = [
      "fieldGoalsMade-fieldGoalsAttempted", "fieldGoalPct",
      "threePointFieldGoalsMade-threePointFieldGoalsAttempted", "threePointFieldGoalPct",
      "freeThrowsMade-freeThrowsAttempted", "freeThrowPct",
      "totalRebounds", "offensiveRebounds", "defensiveRebounds",
      "assists", "steals", "blocks",
      "turnovers", "teamTurnovers", "totalTurnovers",
      "fouls", "technicalFouls", "totalTechnicalFouls", "flagrantFouls",
      "pointsInPaint", "fastBreakPoints", "turnoverPoints",
      "largestLead", "leadChanges", "leadPercentage",
    ];
    const priorityIndex = new Map(statPriority.map((key, index) => [key, index]));
    const keys = sourceKeys.sort((a, b) =>
      (priorityIndex.get(a) ?? statPriority.length) - (priorityIndex.get(b) ?? statPriority.length));
    return html`
      <section class="panel team-stats-panel">
        <div class="panel-head"><h3>${this._t("COMPARAISON DES ÉQUIPES")}</h3><span class="pill">TEAM STATS</span></div>
        <div class="table-wrap"><table><thead><tr><th>${this._t("STATISTIQUE")}</th>${teams.map((team) => html`<th>${value(team.abbr, team.name)}</th>`)}</tr></thead>
          <tbody>${keys.map((key) => {
            const label = teams.flatMap((team) => team.statistics ?? []).find((stat) => stat.name === key)?.label ?? key;
            return html`<tr><td>${label}</td>${teams.map((team) => html`<td>${value((team.statistics ?? []).find((stat) => stat.name === key)?.value)}</td>`)}</tr>`;
          })}</tbody>
        </table></div>
      </section>`;
  }


  _playByPlayPanel() {
    const plays = this._overlayDetails?.plays ?? [];
    if (!plays.length) return "";
    const filtered = this._scoringOnly ? plays.filter((play) => play.scoring) : plays;
    // The backend already normalizes ESPN sequence numbers chronologically.
    // The latest action is shown first; the default view keeps the 12 most recent events.
    const chronologicalRows = this._showAllPlays ? filtered : filtered.slice(-12);
    const rows = [...chronologicalRows].reverse();
    return html`
      <section class="panel playbyplay-panel">
        <div class="panel-head"><h3>${this._t("FIL DU MATCH")}</h3><div class="overlay-actions"><span class="pill">${plays.length} ACTIONS</span><button class="overlay-refresh" type="button" ?disabled=${this._overlayLoading} @click=${() => this._refreshGameDetails()}>${this._overlayLoading ? "ACTUALISATION…" : "↻ ACTUALISER"}</button></div></div>
        <div class="play-controls">
          <button class="chip" aria-pressed=${!this._scoringOnly} @click=${() => { this._scoringOnly = false; this._showAllPlays = false; }}>${this._t("TOUTES")}</button>
          <button class="chip" aria-pressed=${this._scoringOnly} @click=${() => { this._scoringOnly = true; this._showAllPlays = false; }}>${this._t("POINTS SEULEMENT")}</button>
        </div>
        <ol class="play-list">${rows.map((play) => html`
          <li class="play-row ${play.scoring ? "scoring" : ""}">
            <span class="play-clock">${value(play.period_display, Number(play.period) > 4 ? (Number(play.period) === 5 ? "OT" : `${Number(play.period) - 4}OT`) : `Q${value(play.period)}`)}<small>${value(play.clock)}</small></span>
            <span class="play-copy">${value(play.text, play.type || "Action")}${play.scoring ? html`<small>MARQUE · +${value(play.score_value, "?")} PT</small>` : ""}</span>
            <span class="play-score">${play.away_score != null || play.home_score != null ? `${value(play.away_score)}–${value(play.home_score)}` : ""}</span>
          </li>`)}</ol>
        ${filtered.length > 12 ? html`<button class="chip play-more" @click=${() => { this._showAllPlays = !this._showAllPlays; }}>${this._showAllPlays ? this._t("RÉDUIRE") : `${this._t("VOIR LES")} ${filtered.length} ${this._t("ACTIONS")}`}</button>` : ""}
      </section>`;
  }

  _gameStatus(game) {
    if (game.state === "in") {
      const period = Number(game.period);
      const periodLabel = Number.isFinite(period) && period > 0 ? (period > 4 ? (period - 4) + "OT" : "Q" + period) : "";
      const detail = [periodLabel, game.clock].filter(Boolean).join(" · ");
      return { label: detail ? "LIVE · " + detail : "LIVE", live: true, className: "live" };
    }
    if (game.state === "post") return { label: game.detail || "FINAL", live: false, className: "final" };
    return { label: this._t("À VENIR"), live: false, className: "scheduled" };
  }

  _gameCard(game) {
    const home = game.home ?? {}, away = game.away ?? {};
    const status = this._gameStatus(game);
    const played = game.state === "in" || game.state === "post";
    const gameClass = game.state === "in" ? "live-game" : game.state === "post" ? "final-game" : "";
    return html`
      <article class="game ${gameClass}" role="button" tabindex="0" @click=${() => this._openGame(game)} @keydown=${(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._openGame(game); } }}>
        <div class="game-main">
          <div class="game-date">${value(game.date_text, fmtDate(game.date))}</div>
          <div class="matchup">
            <div class="side away ${away.winner ? "winner" : ""}"><span class="team-name">${value(away.abbr, away.name)}</span>
              ${away.logo ? html`<img class="logo" src=${away.logo} alt="" loading="lazy">` : ""}</div>
            <div class="score ${played ? "" : "pending"}">${played ? `${value(away.score)} – ${value(home.score)}` : "VS"}</div>
            <div class="side ${home.winner ? "winner" : ""}">${home.logo ? html`<img class="logo" src=${home.logo} alt="" loading="lazy">` : ""}
              <span class="team-name">${value(home.abbr, home.name)}</span></div>
          </div>
        </div>
        <div class="status ${status.className}">${status.label}</div>
      </article>`;
  }

  _filteredGames(rows) {
    const term = this._search.trim().toLowerCase();
    return rows.filter((game) => {
      const status = this._filter === "all" || game.state === this._filter;
      const names = `${game.home?.name ?? ""} ${game.home?.abbr ?? ""} ${game.away?.name ?? ""} ${game.away?.abbr ?? ""}`.toLowerCase();
      return status && (!term || names.includes(term));
    });
  }

  _leaderPanel(key, limit = 5, postseason = false, rowsOverride = null) {
    const rows = rowsOverride ?? this._leaders(key, postseason).rows;
    return html`
      <section class="panel">
        <div class="panel-head"><h3>${LEADERS[key][0]}</h3><span class="pill">${postseason ? "PLAYOFFS" : "SAISON"}</span></div>
        ${rows.length ? html`<div class="leader-list">${rows.slice(0, limit).map((p, i) => html`
          <button class="leader leader-button" type="button" aria-label="Voir le profil de ${value(p.player)}" @click=${() => this._openPlayer(p.id, p)}>
            <span class="rank">${value(p.rank, i + 1)}</span>
            ${p.headshot ? html`<img class="avatar" src=${p.headshot} alt="" loading="lazy">` : html`<div class="avatar"></div>`}
            <span class="player">${value(p.player)}<small>${value(p.team)}</small></span>
            <span class="stat">${value(p.value)}</span>
          </button>`)}</div>` : html`<p class="muted">${this._t("Données de classement indisponibles.")}</p>`}
      </section>`;
  }

  _openStandingTeam(row) {
    if (!row?.team_id) return;
    const team = this._teamsCatalog().teams.find((item) => String(item.id) === String(row.team_id)) ?? {
      id: row.team_id,
      name: row.team,
      display_name: row.team,
      abbreviation: row.abbr,
      logo: row.logo,
    };
    this._openTeam(team);
  }

  _standingsTable(slug, label, rowsOverride = null) {
    const rows = rowsOverride ?? this._standings(slug).rows;
    return html`
      <section class="panel">
        <div class="panel-head"><h3>${label}</h3><span class="pill">${rows.length} ${this._t("ÉQUIPES")}</span></div>
        ${rows.length ? html`<div class="table-wrap"><table>
          <thead><tr><th>#</th><th>${this._t("ÉQUIPE")}</th><th>V</th><th>D</th><th>%</th><th>GB</th><th>${this._t("SÉRIE")}</th></tr></thead>
          <tbody>${rows.slice(0,15).map((r,i) => html`
            <tr><td>${value(r.rank,i+1)}</td><td><button class="standing-team-button" type="button" ?disabled=${!r.team_id} @click=${() => this._openStandingTeam(r)}>${r.logo ? html`<img src=${r.logo} alt="" loading="lazy">` : ""}<span>${value(r.abbr,r.team)}</span></button></td><td>${value(r.wins)}</td>
            <td>${value(r.losses)}</td><td>${value(r.pct)}</td><td>${value(r.gb)}</td><td class="standing-streak">${value(r.streak)}</td></tr>`)}</tbody>
        </table></div>` : html`<p class="muted">${this._t("Classement indisponible.")}</p>`}
      </section>`;
  }

  _teamPanel(team) {
    const last = team.last, next = team.next;
    return html`
      <section class="panel">
        <div class="team-row">
          ${team.logo ? html`<img class="logo large" src=${team.logo} alt="" loading="lazy">` : ""}
          <div class="team-info"><strong>${team.name}</strong><small>${this._t("Équipe favorite")} · ${team.id}</small></div>
          ${team.live?.state === "in" ? html`<span class="pill accent">${this._t("LIVE")}</span>` : ""}
        </div>
        <div class="team-row"><div class="team-info"><small>${this._t("DERNIER MATCH")}</small><strong>${value(last?.name,this._t("Donnée indisponible"))}</strong></div>
          <div class="record">${value(last?.away?.score)} – ${value(last?.home?.score)}</div></div>
        <div class="team-row"><div class="team-info"><small>${this._t("PROCHAIN MATCH")}</small><strong>${value(next?.name,"Calendrier indisponible")}</strong>
          <small>${value(next?.date_text,"")}</small></div></div>
        ${team.recent?.length ? html`
          <div class="muted" style="margin-top:10px">${this._t("FORME RÉCENTE")}</div>
          <div class="recent">${team.recent.slice(0,5).map((game) => html`
            <span class="form-chip ${game.result === "V" ? "win" : game.result === "D" ? "loss" : "unknown"}">
              <strong>${value(game.result)}</strong><span>${value(game.opp_abbr)}</span>
              <span>${value(game.team_score)}–${value(game.opp_score)}</span>
            </span>`)}</div>` : ""}
      </section>`;
  }

  _homeView() {
    const { rows } = this._games();
    const live = rows.filter((game) => game.state === "in");
    const next = rows.filter((game) => game.state === "pre").slice(0, 4);
    const teams = this._teams();
    const catalog = this._teamsCatalog().teams;
    const featuredTeams = teams.slice(0, 6);
    const daily = this._dataStatus()?.attributes?.daily_performances ?? {};
    const dailyCategories = [{ key: "points", label: "MARQUEURS", unit: "PTS" }, { key: "rebounds", label: "REBONDEURS", unit: "REB" }, { key: "assists", label: "PASSEURS", unit: "AST" }];
    return html`
      <div class="head"><h2>${this._t("NBA TODAY")}</h2><span class="pill">${this._t("TABLEAU DE BORD")}</span></div>
      <section class="home-live panel">
        <div class="panel-head"><div><span class="home-kicker">${this._t("SUIVI EN TEMPS RÉEL")}</span><h3>NBA LIVE</h3></div>
          <span class="home-live-count ${live.length ? "is-live" : ""}">${live.length ? `● ${live.length} EN DIRECT` : "AUCUN MATCH LIVE"}</span></div>
        ${live.length ? html`<div class="home-game-list">${live.map((game) => this._gameCard(game))}</div>` :
          html`<div class="home-empty"><span class="home-empty-icon">🏀</span><div><strong>${this._t("Pas de match en direct")}</strong><p>${this._t("Les rencontres en cours apparaîtront ici automatiquement.")}</p></div></div>`}
      </section>
      <div class="home-grid">
        <section class="panel home-upcoming">
          <div class="panel-head"><div><span class="home-kicker">${this._t("LE CALENDRIER")}</span><h3>${this._t("PROCHAINS MATCHS")}</h3></div><span class="pill">${next.length} MATCHS</span></div>
          ${next.length ? html`<div class="home-game-list">${next.map((game) => this._gameCard(game))}</div>` :
            html`<p class="muted">${this._t("Aucun match prévu dans les prochaines 24 heures.")}</p>`}
        </section>
        <section class="panel home-favorites">
          <div class="panel-head"><div><span class="home-kicker">${this._t("À SUIVRE")}</span><h3>${this._t("MES ÉQUIPES")}</h3></div><span class="pill">${teams.length} ${this._t("FAVORIS")}</span></div>
          ${featuredTeams.length ? html`<div class="home-favorite-list">${featuredTeams.map((team) => {
            const catalogTeam = catalog.find((item) => String(item.id) === String(team.id)) ?? team;
            const recent = team.recent?.slice(0, 5) ?? [];
            const nextGame = team.next;
            const isHome = nextGame && String(nextGame.home?.id) === String(team.id);
            const opponent = nextGame ? (isHome ? nextGame.away : nextGame.home) : null;
            return html`<button class="home-favorite" type="button" @click=${() => this._openTeam(catalogTeam)}>
              ${team.logo ? html`<img src=${team.logo} alt="" loading="lazy">` : html`<span class="home-favorite-placeholder">🏀</span>`}
              <span class="home-favorite-main"><strong>${value(team.name)}</strong>${team.live?.state === "in" ? html`<span class="home-next-label" style="color:#ff858b">${this._t("● MATCH EN DIRECT")}</span><span class="home-next-date">${value(team.live.detail, "EN COURS")}</span>` : nextGame?.date_text ? html`<span class="home-next-label">PROCHAIN MATCH · ${isHome ? "DOMICILE" : "EXTÉRIEUR"}</span><span class="home-next-date">${opponent?.logo ? html`<img class="home-opponent-logo" src=${opponent.logo} alt="" loading="lazy">` : ""}${value(opponent?.abbr, opponent?.name)} · ${value(nextGame.date_text)}</span>` : html`<small>${team.last ? `DERNIER MATCH · ${value(team.last.name)}` : "CALENDRIER INDISPONIBLE"}</small>`}
                ${recent.length ? html`<span class="home-form">${recent.slice(0,5).map((game) => html`<i class="${game.result === "V" ? "win" : game.result === "D" ? "loss" : ""}">${value(game.result)}</i>`)}</span>` : ""}</span>
              <span class="home-favorite-arrow">›</span>
            </button>`;
          })}</div>` : html`<p class="muted">${this._t("Choisis tes équipes favorites dans la configuration de l'intégration NBA.")}</p>`}
        </section>
      </div>
      <section class="home-highlights">
        <div class="home-section-heading"><div><span class="home-kicker">${this._t("LES PERFORMANCES")}</span><h3>${this._t("À LA UNE")}</h3></div><span class="pill">${value(daily.date, this._t("DERNIÈRE JOURNÉE"))}</span></div>
        <div class="grid home-daily-grid">
          ${dailyCategories.map((category) => {
            const rows = daily.categories?.[category.key] ?? [];
            return html`<section class="panel home-daily-panel"><div class="panel-head"><h3>${category.label}</h3><span class="home-daily-unit">${category.unit}</span></div>
              ${rows.length ? html`<div class="home-daily-list">${rows.map((player, index) => html`<button class="home-daily-player home-daily-player-button" type="button" aria-label=${"`Afficher le match de ${player.player}`"} @click=${() => this._openGame({ id: String(player.game_id), state: "post", name: `${player.team} vs ${player.opponent ?? ""}` })}>
                <span class="home-daily-rank">${index + 1}</span>
                ${player.headshot ? html`<img src=${player.headshot} alt="" loading="lazy">` : html`<span class="home-daily-avatar"></span>`}
                <span class="home-daily-info"><strong>${value(player.player)}</strong><small>${value(player.team)} ${player.opponent ? `· vs ${player.opponent}` : ""}</small></span>
                <b>${value(player.value)}</b>
              </button>`)}</div>` : html`<p class="muted">${this._t("Performances indisponibles pour cette journée.")}</p>`}
            </section>`;
          })}
        </div>
      </section>`;
  }

  _scoresView() {
    const rows = this._calendarGames;
    const filtered = this._filteredGames(rows);
    const weekday = new Intl.DateTimeFormat(this.hass?.locale?.language ?? this.hass?.language ?? "fr-BE", { weekday: "short" }).format(new Date(`${this._selectedDate}T12:00:00`)).replace(".", "").slice(0, 3).toUpperCase();
    return html`
      <div class="head"><h2>${this._t("SCORES & CALENDRIER")}</h2><span class="pill">${rows.length} ${this._t("MATCHS")}</span></div>
      <div class="date-nav"><button aria-label=${this._t("Jour précédent")} @click=${() => this._shiftDate(-1)}>‹</button>
        <label class="date-picker-control"><span class="date-weekday">${weekday}</span><input type="date" aria-label=${this._t("Choisir une date")} .value=${this._selectedDate} @change=${this._setDate}></label>
        <button aria-label=${this._t("Jour suivant")} @click=${() => this._shiftDate(1)}>›</button>
        <button @click=${() => { this._selectedDate = localDateISO(new Date(), this.hass?.config?.time_zone); this._loadCalendar(this._selectedDate); }}>${this._t("AUJOURD&#39;HUI")}</button></div>
      ${this._calendarStale ? html`<p class="muted" role="status">${this._t("Données en cache")} · ${this._t("actualisation ESPN indisponible")}${this._calendarStaleError ? html` · ${this._calendarStaleError}` : ""}</p>` : ""}
      <div class="filters">${[["all",this._t("TOUS")],["in","LIVE"],["pre",this._t("À VENIR")],["post",this._t("TERMINÉS")]].map(([k,l]) => html`<button class="chip" aria-pressed=${this._filter===k} @click=${() => this._setFilter(k)}>${l}</button>`)}
        <input type="search" aria-label=${this._t("Rechercher une équipe")} placeholder=${this._t("Filtrer une équipe…")} .value=${this._search} @input=${this._setSearch}></div>
      ${this._calendarLoading ? html`<section class="empty">${this._t("Chargement du calendrier…")}</section>` : ""}
      ${this._calendarError ? html`<section class="empty"><strong>${this._t("Calendrier indisponible")}</strong><p>${this._calendarError}</p><button @click=${() => this._loadCalendar(this._selectedDate)}>${this._t("RÉESSAYER")}</button></section>` : ""}
      ${!this._calendarLoading && !this._calendarError && filtered.length ? html`<div class="game-list">${filtered.map((g) => this._gameCard(g))}</div>` : ""}
      ${!this._calendarLoading && !this._calendarError && !filtered.length ? html`<section class="empty"><strong>${rows.length ? this._t("Aucun match correspondant") : this._t("Aucun match programmé")}</strong><p>${rows.length ? this._t("Modifie les filtres ou la recherche.") : this._t("Aucune rencontre n'est prévue pour cette date dans le fuseau horaire de Home Assistant.")}</p></section>` : ""}
    `;
  }
  _teamCatalogCard(team) {
    const favorite = team.favoriteData;
    return html`<section class="panel catalog-team" role="button" tabindex="0" @click=${() => this._openTeam(team)} @keydown=${(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this._openTeam(team); } }}>
      <div class="team-row">
        ${team.logo ? html`<img class="logo large" src=${team.logo} alt="" loading="lazy">` : ""}
        <div class="team-info"><strong>${value(team.display_name, team.name)}</strong>
          <small>${value(team.abbreviation)} · ${value(team.conference, this._t("Conférence inconnue"))} · ${value(team.division, this._t("Division inconnue"))}</small></div>
        ${team.favorite ? html`<span class="pill accent">${this._t("FAVORI")}</span>` : ""}
      </div>
      ${favorite ? html`<div class="catalog-favorite-tracking"><span>${this._t("DERNIER MATCH")} · ${value(favorite.last?.name, "—")}</span><span>${this._t("PROCHAIN MATCH")} · ${value(favorite.next?.date_text, "—")} ${value(favorite.next?.name, "")}</span>${favorite.live?.state === "in" ? html`<strong class="pill accent">${this._t("MATCH EN DIRECT")}</strong>` : ""}</div>` : ""}
    </section>`;
  }

  _teamsView() {
    const catalog = this._teamsCatalog();
    const term = this._teamSearch.trim().toLowerCase();
    const teams = catalog.teams.filter((team) => {
      const matchesSearch = !term || [team.name, team.display_name, team.abbreviation, team.nickname, team.city].filter(Boolean).join(" ").toLowerCase().includes(term);
      const conference = String(team.conference ?? "").toLowerCase();
      const matchesConference = this._teamConference === "all" ||
        (this._teamConference === "east" ? conference.includes("east") : conference.includes("west"));
      return matchesSearch && matchesConference;
    });
    return html`
      <div class="head"><h2>${this._t("TEAMS CENTER")}</h2><span class="pill">${catalog.count}/30 FRANCHISES</span></div>
      ${!catalog.complete ? html`<p class="muted" role="status">${this._t("Catalogue partiel ou en attente")} · ${catalog.count} ${this._t("équipes reçues")}</p>` : ""}
      <div class="filters">
        <button class="chip" aria-pressed=${this._teamConference === "all"} @click=${() => this._setTeamConference("all")}>${this._t("TOUTES")}</button>
        <button class="chip" aria-pressed=${this._teamConference === "east"} @click=${() => this._setTeamConference("east")}>${this._t("EAST")}</button>
        <button class="chip" aria-pressed=${this._teamConference === "west"} @click=${() => this._setTeamConference("west")}>${this._t("WEST")}</button>
        <input type="search" aria-label=${this._t("Rechercher une franchise NBA")} placeholder=${this._t("Rechercher une équipe…")} .value=${this._teamSearch} @input=${this._setTeamSearch}>
      </div>
      ${teams.length ? html`<div class="grid">${teams.map((team) => this._teamCatalogCard(team))}</div>` :
        html`<section class="empty"><strong>${catalog.count ? this._t("Aucune franchise correspondante") : this._t("Catalogue des équipes indisponible")}</strong><p>${catalog.count ? "Modifie la recherche ou le filtre de conférence." : "Le capteur Catalogue des équipes n'a pas encore reçu les données ESPN."}</p></section>`}
    `;
  }

  _playersView() {
    const currentSeason = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    const firstYear = this._playersPhase === "playoffs" ? 2008 : 2002;
    const years = Array.from({ length: currentSeason - firstYear + 1 }, (_, index) => currentSeason - index);
    const postseason = this._playersPhase === "playoffs";
    return html`<div class="head"><div><h2>${this._t("PLAYERS CENTER")}</h2><p class="muted">${this._t("Classements officiels ESPN · moyennes par match")}</p></div>
        <select class="playoff-season" aria-label="Choisir la saison des classements joueurs" .value=${String(this._playersSeason)} @change=${(event) => this._setPlayersSeason(event)}>
          ${years.map((year) => html`<option value=${year}>${year - 1}-${String(year).slice(-2)}</option>`)}
        </select>
      </div>
      <p class="muted">${this._t("Sélectionne directement un joueur dans un classement pour ouvrir sa fiche détaillée.")}</p>
      <div class="filters">
        <button class="chip" aria-pressed=${!postseason} @click=${() => this._setPlayersPhase("regular")}>${this._t("SAISON RÉGULIÈRE")}</button>
        <button class="chip" aria-pressed=${postseason} @click=${() => this._setPlayersPhase("playoffs")}>${this._t("PLAYOFFS")}</button>
      </div>
      ${this._playersLoading ? html`<section class="empty"><p>${this._t("Chargement des classements ESPN…")}</p></section>` : ""}
      ${this._playersError ? html`<section class="empty"><strong>${this._t("Classements indisponibles")}</strong><p>${value(this._playersError)}</p></section>` : ""}
      ${this._playersLeaders?.available ? html`<div class="grid">${Object.keys(LEADERS).map((key) => this._leaderPanel(key,10,postseason,this._playersLeaders.leaders?.[key] ?? []))}</div>` :
        !this._playersLoading && !this._playersError ? html`<section class="empty"><strong>${this._t("Aucun classement disponible")}</strong><p>${this._t("ESPN ne fournit pas de données pour cette saison et cette compétition.")}</p></section>` : ""}
    `;
  }

  _setPlayersSeason(event) {
    const year = Number(event.target.value);
    if (!Number.isInteger(year) || year < (this._playersPhase === "playoffs" ? 2008 : 2002) || year > 2100) return;
    this._playersSeason = year;
    this._loadPlayerLeaders();
  }

  _setPlayersPhase(phase) {
    if (!["regular", "playoffs"].includes(phase) || phase === this._playersPhase) return;
    this._playersPhase = phase;
    if (phase === "playoffs" && this._playersSeason < 2008) this._playersSeason = 2008;
    this._loadPlayerLeaders();
  }

  async _loadPlayerLeaders() {
    if (!this.hass?.callWS) return;
    const year = this._playersSeason;
    const postseason = this._playersPhase === "playoffs";
    const key = `${year}:${postseason ? 3 : 2}`;
    const cached = this._playersLeadersCache.get(key);
    const ttl = year === (new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0)) ? 15 * 60 * 1000 : 7 * 86400 * 1000;
    if (cached && Date.now() - cached.at < ttl) {
      this._playersLeaders = cached.data;
      this._playersError = "";
      this._playersLoading = false;
      return;
    }
    const request = ++this._playersRequest;
    this._playersLoading = true;
    this._playersError = "";
    this._playersLeaders = null;
    try {
      const result = await this.hass.callWS({ type: "nba_center/player_leaders", season_year: year, postseason });
      if (request !== this._playersRequest || year !== this._playersSeason || postseason !== (this._playersPhase === "playoffs")) return;
      this._playersLeadersCache.set(key, { at: Date.now(), data: result });
      this._playersLeaders = result;
      if (!result?.available) this._playersError = Object.values(result?.errors ?? {}).find(Boolean) ?? "";
    } catch (err) {
      if (request !== this._playersRequest) return;
      this._playersError = err?.message ?? "Impossible de charger les classements de cette saison.";
    } finally {
      if (request === this._playersRequest) this._playersLoading = false;
    }
  }

  _statsView() {
    const currentSeasonYear = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0);
    const firstAvailableYear = this._standingPhase === "playoffs" ? 2008 : 2002;
    const years = Array.from({ length: currentSeasonYear - firstAvailableYear + 1 }, (_, index) => currentSeasonYear - index);
    const standings = this._seasonStandings?.standings ?? {};
    const eastKey = Object.keys(standings).find((name) => name.toLowerCase().includes("eastern")) ?? "Eastern Conference";
    const westKey = Object.keys(standings).find((name) => name.toLowerCase().includes("western")) ?? "Western Conference";
    const eastRows = standings[eastKey] ?? [];
    const westRows = standings[westKey] ?? [];
    return html`
      <div class="head"><div><h2>${this._t("STANDINGS CENTER")}</h2><p class="muted">${this._t("Classements officiels ESPN · saison régulière et playoffs")}</p></div>
        <select class="playoff-season" aria-label="Choisir la saison NBA" .value=${String(this._standingSeason)} @change=${this._setStandingsSeason}>
          ${years.map((year) => html`<option value=${year}>${year - 1}-${String(year).slice(-2)}</option>`)}
        </select>
      </div>
      <div class="filters">
        <button class="chip" aria-pressed=${this._standingPhase === "regular"} @click=${() => this._setStandingsPhase("regular")}>${this._t("SAISON RÉGULIÈRE")}</button>
        <button class="chip" aria-pressed=${this._standingPhase === "playoffs"} @click=${() => this._setStandingsPhase("playoffs")}>${this._t("PLAYOFFS")}</button>
      </div>
      ${this._standingPhase === "regular" ? html`
        ${this._seasonStandingsLoading ? html`<section class="empty">Chargement du classement ${this._standingSeason - 1}-${String(this._standingSeason).slice(-2)}…</section>` : ""}
        ${this._seasonStandingsError ? html`<section class="empty"><strong>${this._t("Classement indisponible")}</strong><p>${this._seasonStandingsError}</p><button @click=${() => this._loadHistoricalStandings()}>${this._t("RÉESSAYER")}</button></section>` : ""}
        ${!this._seasonStandingsLoading && this._seasonStandings ? html`
          <div class="grid">
            ${this._standingsTable("east", "EASTERN CONFERENCE", eastRows)}
            ${this._standingsTable("west", "WESTERN CONFERENCE", westRows)}
          </div>` : ""}
      ` : this._playoffsView()}
    `;
  }

  render() {
    const active = VIEWS.find((v) => v.id === this._active) ?? VIEWS[0];
    const dataStatus = this._dataStatus();
    const degraded = dataStatus?.state !== "À jour" || dataStatus?.attributes?.stale;
    const view = { home: () => this._homeView(), scores: () => this._scoresView(),
      teams: () => this._teamsView(), players: () => this._playersView(), stats: () => this._statsView() };
    return html`
      <ha-card class="shell">
        <header class="hero">
          <h1>${this._config.title}</h1><div class="subtitle">${this._config.subtitle}</div>
          <div class="meta"><span class="dot"></span><span>NBA DATA</span><span>·</span>
            <span>${this.hass ? this._t("CONNECTED TO ESPN API") : this._t("WAITING FOR ESPN API")}</span>
            ${dataStatus ? html`<span class="data-health ${degraded ? "degraded" : "healthy"}">${degraded ? this._t("Données partielles") : this._t("FLUX À JOUR")}</span>` : ""}</div>
          ${degraded ? html`<div class="data-warning">Certaines sources ESPN sont indisponibles. Les dernières données valides sont conservées. Consultez l'attribut <strong>errors</strong> du capteur d'état pour le détail.</div>` : ""}
        </header>
        <nav aria-label="NBA Center navigation">${VIEWS.map((v) => html`
          <button type="button" data-view=${v.id} aria-selected=${v.id===this._active}
            @click=${() => this._selectView(v.id)}>${v.label}</button>`)}</nav>
        <main>${this.hass ? view[active.id]() : html`
          <section class="empty"><strong>${this._t("Connexion à Home Assistant…")}</strong><p>${this._t("La carte attend les états de l'intégration NBA.")}</p></section>`}</main>
        ${this._seriesOverlay && !this._overlayGame ? this._playoffSeriesOverlay() : ""}
        ${this._overlayGame ? html`<div class="overlay" @click=${(event) => { if (event.target === event.currentTarget) this._closeOverlay(); }} @keydown=${this._onOverlayKeydown}>
          <section class="overlay-panel" role="dialog" aria-modal="true" aria-label=${this._t("Détails du match")}>
            <header class="overlay-head"><h2>${this._t("MATCH CENTER")}</h2><div class="overlay-actions">
              <button class="overlay-refresh" ?disabled=${this._overlayLoading} @click=${() => this._refreshGameDetails()} aria-label=${this._t("Actualiser les détails du match")}>${this._overlayLoading ? this._t("Chargement…") : `↻ ${this._t("ACTUALISER")}`}</button>
              <button class="overlay-close" aria-label="Fermer" @click=${this._closeOverlay}>✕</button>
            </div></header>
            <div class="overlay-body"><div class="overlay-teams">
              <div class="overlay-team">${this._overlayGame.away?.logo ? html`<button class="match-team-logo-button" type="button" aria-label=${`Ouvrir la fiche ${value(this._overlayGame.away?.name, this._t("équipe visiteuse"))}`} title=${this._t("Ouvrir la fiche équipe")} @click=${() => this._openMatchTeam(this._overlayGame.away)}><img src=${this._overlayGame.away.logo} alt=""></button>` : ""}<strong>${value(this._overlayGame.away?.name)}</strong></div>
              <div class="overlay-score">${this._overlayGame.state === "pre" ? "VS" : `${value(this._overlayGame.away?.score)} – ${value(this._overlayGame.home?.score)}`}</div>
              <div class="overlay-team">${this._overlayGame.home?.logo ? html`<button class="match-team-logo-button" type="button" aria-label=${`Ouvrir la fiche ${value(this._overlayGame.home?.name, this._t("équipe à domicile"))}`} title=${this._t("Ouvrir la fiche équipe")} @click=${() => this._openMatchTeam(this._overlayGame.home)}><img src=${this._overlayGame.home.logo} alt=""></button>` : ""}<strong>${value(this._overlayGame.home?.name)}</strong></div>
            </div><p class="muted" style="text-align:center">${value(this._overlayGame.date_text)} · ${value(this._overlayGame.detail, this._gameStatus(this._overlayGame).label)}</p>
            ${this._overlayLoading ? html`<section class="empty">${this._t("Chargement du résumé…")}</section>` : ""}
            ${(this._overlayError || this._overlayDetails?.error) ? html`<section class="empty"><p>${value(this._overlayError || this._overlayDetails?.error, this._t("Détails du match indisponibles."))}</p><button @click=${() => this._openGame(this._overlayGame)}>${this._t("RÉESSAYER")}</button></section>` : ""}
            ${this._overlayDetails?.teams?.length ? html`<div class="game-leaders-grid">${this._awayFirst(this._overlayDetails.teams).map((team) => html`
              <section class="panel game-leader-card"><div class="panel-head"><h3>${value(team.abbr, team.name)}</h3><span class="pill">${this._t("LEADERS")}</span></div>
                ${(team.top_players ?? []).length ? team.top_players.map((player) => html`<div class="game-leader"><span class="game-leader-category">${value(player.category)}</span><span class="game-leader-name">${value(player.player)}</span><strong class="game-leader-value">${value(player.value)}</strong></div>`) : html`<div class="game-leaders-empty">${this._t("Statistiques des leaders indisponibles.")}</div>`}</section>`)}</div>` : ""}
            ${this._quarterScorePanel()}
            ${this._overlayDetails?.has_boxscore ? html`
              <div class="boxscore-section"><div class="section-kicker">${this._t("FULL GAME BREAKDOWN")}</div><h3>${this._t("BOX SCORE · JOUEURS")}</h3>
                <div class="boxscore-grid">${this._awayFirst(this._overlayDetails.player_stats, (block) => this._overlayDetails.team_stats?.find((team) => team.team_id === block.team_id)?.home_away).map((block) => this._boxscorePanel(block))}</div>
                ${this._teamStatsPanel()}
              </div>` : ""}
            ${this._playByPlayPanel()}
            ${!this._overlayLoading && !this._overlayError && !this._overlayDetails?.error && !this._overlayDetails?.teams?.length && !this._overlayDetails?.has_boxscore ? html`<section class="empty"><p>${this._t("Le résumé détaillé n’est pas encore disponible pour cette rencontre.")}</p></section>` : ""}            </div></section></div>` : ""}
        ${this._teamOverlay ? this._teamRosterPanel() : ""}
        ${this._playerOverlay ? this._playerProfilePanel() : ""}
        <footer class="footer"><span>NBA CENTER · ${active.label}</span><span>${BUILD_VERSION}</span></footer>
      </ha-card>`;
  }

  static getStubConfig() { return { title: "NBA CENTER HomeAssistant", subtitle: "Your league. Your teams. One center." }; }
}

if (!customElements.get("nba-center-ha-card")) customElements.define("nba-center-ha-card", NBACenterCard);
window.customCards = window.customCards ?? [];
console.info(`[NBA Center] ${BUILD_VERSION}`);
if (!window.customCards.some((card) => card.type === "nba-center-ha-card")) {
  window.customCards.push({ type: "nba-center-ha-card", name: "NBA Center",
    description: "NBA Dark dashboard — scores, teams, players and stats", preview: true });
}
