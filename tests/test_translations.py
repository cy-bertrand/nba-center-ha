"""Tests for Home Assistant entity and service translations."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "nba_center"


class TranslationTests(unittest.TestCase):
    def _translations(self):
        return {
            language: json.loads(
                (COMPONENT / "translations" / f"{language}.json").read_text(encoding="utf-8")
            )
            for language in ("en", "fr")
        }

    def test_translation_files_define_the_same_sensor_keys(self):
        files = self._translations()
        keys = set(files["en"]["entity"]["sensor"])
        self.assertEqual(keys, set(files["fr"]["entity"]["sensor"]))
        self.assertEqual(
            keys,
            set(json.loads((COMPONENT / "strings.json").read_text(encoding="utf-8"))["entity"]["sensor"]),
        )

    def test_dynamic_team_sensor_names_have_team_name_placeholder(self):
        for language, translations in self._translations().items():
            sensors = translations["entity"]["sensor"]
            for key in ("team_last", "team_next", "team_live", "team_recent_games"):
                self.assertIn("{team_name}", sensors[key]["name"], f"{language}: {key}")

    def test_sensor_uses_translation_keys_for_all_entity_names(self):
        source = (COMPONENT / "sensor.py").read_text(encoding="utf-8")
        for key in ("today_games", "teams_catalog", "data_status", '"team_recent_games"'):
            self.assertIn(key, source)
        for pattern in (
            'f"{slug}_standings"',
            'f"leaders_{key}"',
            'f"playoff_leaders_{key}"',
            'f"team_{kind}"',
        ):
            self.assertIn(pattern, source)

    def test_data_status_sensor_exposes_stable_machine_identifiers(self):
        sensor = (COMPONENT / "sensor.py").read_text(encoding="utf-8")
        frontend = (ROOT / "frontend" / "src" / "nba-center-card.js").read_text(encoding="utf-8")
        self.assertIn('"status_key": "degraded" if data.get("data_stale") or errors else "up_to_date"', sensor)
        self.assertIn('"scope_key": "main_data"', sensor)
        self.assertIn('state.attributes?.scope_key === "main_data"', frontend)
        # Keep the legacy scope lookup while existing installations update.
        self.assertIn('!state.attributes?.scope_key && state.attributes?.scope === "scoreboard, standings, calendriers favoris, classements et catalogue des équipes"', frontend)

    def test_leader_sensors_expose_stable_category_identifiers(self):
        sensor = (COMPONENT / "sensor.py").read_text(encoding="utf-8")
        frontend = (ROOT / "frontend" / "src" / "nba-center-card.js").read_text(encoding="utf-8")
        self.assertIn('"category_key": self._key', sensor)
        self.assertIn('"category_scope": "season"', sensor)
        self.assertIn('"category_scope": "playoffs"', sensor)
        self.assertIn('attrs.category_key === key', frontend)
        self.assertIn('attrs.category_scope === (postseason ? "playoffs" : "season")', frontend)
        # Legacy category labels remain a fallback for already installed sensors.
        self.assertIn('attrs.category_key == null && category.includes(fragment)', frontend)
        self.assertIn('category.startsWith("playoffs ")', frontend)

    def test_team_sensors_expose_stable_metadata_for_frontend_lookup(self):
        sensor = (COMPONENT / "sensor.py").read_text(encoding="utf-8")
        frontend = (ROOT / "frontend" / "src" / "nba-center-card.js").read_text(encoding="utf-8")
        self.assertIn('"team_sensor_type": self._kind', sensor)
        self.assertIn('"team_sensor_type": "recent"', sensor)
        self.assertIn('"team_name": info.get("name")', sensor)
        self.assertIn('attrs.team_sensor_type', frontend)
        self.assertIn('attrs.team_name ??', frontend)
        # Preserve the legacy French friendly-name matching during migration.
        self.assertIn('friendly.includes("dernier match")', frontend)
        self.assertIn('friendly.includes("prochain match")', frontend)
        self.assertIn('friendly.includes("match en cours")', frontend)

    def test_game_notification_blueprint_supports_both_message_languages(self):
        blueprint = (
            COMPONENT / "blueprints" / "automation" / "nba_game_notification.yaml"
        ).read_text(encoding="utf-8")
        self.assertIn("notification_language: !input notification_language", blueprint)
        self.assertIn("value: fr", blueprint)
        self.assertIn("value: en", blueprint)
        for phrase in ("Game started:", "Game ended:", "Tip-off!", "Match commencé", "Match terminé", "Coup d'envoi"):
            self.assertIn(phrase, blueprint)

    def test_game_notification_blueprint_has_french_and_english_metadata(self):
        root = COMPONENT / "translations" / "blueprints" / "automation" / "nba_game_notification"
        expected = ("notify_targets", "notify_start", "notify_end", "team_filter", "notification_language")
        for language in ("en", "fr"):
            source = (root / f"{language}.yaml").read_text(encoding="utf-8")
            self.assertIn("blueprint:", source)
            for key in expected:
                self.assertIn(f"    {key}:", source, f"{language}: {key}")

    def test_game_details_service_is_translated_in_all_languages(self):
        files = self._translations()
        source = json.loads((COMPONENT / "strings.json").read_text(encoding="utf-8"))
        expected_keys = {"name", "description", "fields"}
        for language, translations in files.items():
            service = translations["services"]["get_game_details"]
            self.assertEqual(set(service), expected_keys, language)
            self.assertIn("game_id", service["fields"], language)
            self.assertTrue(service["name"], language)
            self.assertTrue(service["description"], language)
        self.assertEqual(
            set(files["en"]["services"]["get_game_details"]),
            set(source["services"]["get_game_details"]),
        )

    def test_frontend_visible_labels_use_translation_helper(self):
        frontend = (ROOT / "frontend" / "src" / "nba-center-card.js").read_text(encoding="utf-8")
        translations = (ROOT / "frontend" / "src" / "translations.js").read_text(encoding="utf-8")
        expected = {
            '"EN DIRECT": "LIVE"',
            '"AUCUN MATCH LIVE": "NO LIVE GAMES"',
            '"MATCHS": "GAMES"',
            '"FRANCHISES": "FRANCHISES"',
            '"Modifie la recherche ou le filtre de conférence.": "Change the search or conference filter."',
            '"SÉRIES": "SERIES"',
            '"Fermer": "Close"',
            '"Profil joueur": "Player profile"',
            '"ÉJECTÉ": "EJECTED"',
            '"NON PRIS EN JEU": "DID NOT PLAY"',
        }
        for entry in expected:
            self.assertIn(entry, translations)

        for expression in (
            'this._t("EN DIRECT")',
            'this._t("AUCUN MATCH LIVE")',
            'this._t("MATCHS")',
            'this._t("FRANCHISES")',
            'this._t("Modifie la recherche ou le filtre de conférence.")',
            'this._t("SÉRIES")',
            'this._t("Fermer")',
            'this._t("Profil joueur")',
            'this._t("ÉJECTÉ")',
            'this._t("NON PRIS EN JEU")',
        ):
            self.assertIn(expression, frontend)

        for untranslated in (
            '${next.length} MATCHS',
            '${catalog.count}/30 FRANCHISES',
            '"ÉJECTÉ"',
            '"NON PRIS EN JEU"',
        ):
            self.assertNotIn(untranslated, frontend)


if __name__ == "__main__":
    unittest.main()
