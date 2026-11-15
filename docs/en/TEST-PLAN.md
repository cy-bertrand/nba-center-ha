# Test plan — NBA Center HomeAssistant

## Principles

- Test the Python backend and JavaScript frontend separately.
- Verify public contracts for entities, services, events and automations.
- Test Lovelace rendering and interactions on a real Home Assistant instance.
- CI success does not replace functional testing in a real environment.
- When ESPN data is missing or incomplete, verify that the UI shows a neutral state rather than an invented value.
- Verify seasons, dates and times using the Home Assistant timezone.

## Automated tests

- Python compilation.
- Unit tests and parsing tests.
- ESPN fixtures: completed game, live game, overtime and partial box score.
- JavaScript syntax checks.
- Frontend bundle tests.
- Frontend build and synchronization with the distributed bundle.
- HACS Action validation.
- Hassfest validation.

## Home Assistant functional tests

### Integration and services

- Integration setup and loading.
- Sensor creation and updates.
- `nba_center.get_game_details` service.
- Game start and game end event emission.
- Notification blueprint installation and operation.
- Network errors, empty/incomplete ESPN responses and cache behavior.

### Frontend installation

- Automatic Lovelace resource registration in Storage mode.
- Card loading after integration installation or update.
- YAML mode with manual resource declaration.
- No build tools required on Home Assistant.

### Card and navigation

- Home, scores, standings, teams, players and game detail views.
- Navigation between sections and back navigation.
- Opening and closing detail panels.
- Filters and favorites where available.
- Mobile and larger-screen layouts.
- Empty-data and loading states.

### Match Center

- Home/away team and score order.
- Box score player list, minutes and logical statistic order.
- Play-by-Play chronology, periods and missing data.
- Live, completed, overtime and partial-data games.
- Consistency of game leaders and team statistics.

### Teams Center

- Team list and team detail loading.
- East/West filtering.
- Conference and division when provided by ESPN.
- Schedule, recent results and season information.
- Responsive loading without unnecessary historical roster lookups.

### Players Center and profiles

- Player search, list and profile navigation.
- Current team logo and season team when available.
- Season selection and team consistency.
- Regular season and playoff statistics clearly distinguished.
- Per-game averages are not confused with totals.
- Logical ordering of primary and detailed statistics.
- Consistent height and weight units.
- Last five games: dates, order and home/away indicator.

### Standings and playoffs

- East/West standings, ranks and statistics.
- Playoff and play-in data, series and results.
- Missing ESPN data and season handling.

### Time and timezone

- Timezone and date-boundary behavior.
- ESPN dates compared with dates displayed in Home Assistant.
- Midnight and daylight-saving transitions.

## Acceptance criteria

- No direct ESPN requests from the frontend.
- No fabricated values for missing statistics.
- No regression in existing entities, services, events or automations.
- Main views remain usable on mobile.
- Distributed bundle matches frontend sources.
