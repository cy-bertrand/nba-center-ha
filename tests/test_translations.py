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
        frontend = (COMPONENT / "www" / "nba-center-card.js").read_text(encoding="utf-8")
        self.assertIn('"status_key": "degraded" if data.get("data_stale") or errors else "up_to_date"', sensor)
        self.assertIn('"scope_key": "main_data"', sensor)
        self.assertIn('e.attributes?.scope_key==="main_data"', frontend)
        # Keep the legacy scope lookup while existing installations update.
        self.assertIn('e.attributes?.scope==="scoreboard, standings, calendriers favoris, classements et catalogue des équipes"', frontend)

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


if __name__ == "__main__":
    unittest.main()
