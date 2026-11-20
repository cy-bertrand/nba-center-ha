"""Tests for Home Assistant entity translations."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "nba_center"


class EntityTranslationTests(unittest.TestCase):
    def test_translation_files_define_the_same_sensor_keys(self):
        files = {
            language: json.loads((COMPONENT / "translations" / f"{language}.json").read_text(encoding="utf-8"))
            for language in ("en", "fr")
        }
        keys = set(files["en"]["entity"]["sensor"])
        self.assertEqual(keys, set(files["fr"]["entity"]["sensor"]))
        self.assertEqual(keys, set(json.loads((COMPONENT / "strings.json").read_text(encoding="utf-8"))["entity"]["sensor"]))

    def test_dynamic_team_sensor_names_have_team_name_placeholder(self):
        for language in ("en", "fr"):
            sensors = json.loads((COMPONENT / "translations" / f"{language}.json").read_text(encoding="utf-8"))["entity"]["sensor"]
            for key in ("team_last", "team_next", "team_live", "team_recent_games"):
                self.assertIn("{team_name}", sensors[key]["name"])

    def test_sensor_uses_translation_keys_for_all_entity_names(self):
        source = (COMPONENT / "sensor.py").read_text(encoding="utf-8")
        for key in ("today_games", "teams_catalog", "data_status", '"team_recent_games"'):
            self.assertIn(key, source)
        for pattern in ('f"{slug}_standings"', 'f"leaders_{key}"', 'f"playoff_leaders_{key}"', 'f"team_{kind}"'):
            self.assertIn(pattern, source)


if __name__ == "__main__":
    unittest.main()
