"""Frontend resources for the NBA Center Lovelace card."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from urllib.parse import urlsplit

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

RESOURCE_PATH = "/nba-center-ha/nba-center-card.js"
RESOURCE_URL = RESOURCE_PATH


def _integration_version() -> str:
    """Return the installed integration version for frontend cache busting."""
    manifest_path = Path(__file__).parent / "manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        return str(manifest.get("version") or "1")
    except (OSError, ValueError, TypeError):
        return "1"


def _get_lovelace_resources(hass: HomeAssistant):
    """Return Lovelace resource collection and mode across HA data layouts."""
    lovelace_data = hass.data.get("lovelace")
    if lovelace_data is None:
        return None, None

    # Home Assistant currently exposes a LovelaceData object. Keep support
    # for older releases that exposed a dictionary in hass.data.
    if isinstance(lovelace_data, dict):
        return lovelace_data.get("resources"), lovelace_data.get("mode", "storage")

    return (
        getattr(lovelace_data, "resources", None),
        getattr(lovelace_data, "resource_mode", "storage"),
    )


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Add or update the card resource in Lovelace storage mode."""
    resources, resource_mode = _get_lovelace_resources(hass)

    if resource_mode == "yaml":
        _LOGGER.info(
            "Lovelace resources are configured in YAML; add %s manually "
            "to the lovelace: resources list.",
            RESOURCE_URL,
        )
        return

    if resources is None or not hasattr(resources, "async_create_item"):
        _LOGGER.warning(
            "Lovelace resource storage is unavailable; add %s manually "
            "under Settings > Dashboards > Resources.",
            RESOURCE_URL,
        )
        return

    versioned_url = f"{RESOURCE_PATH}?v={_integration_version()}"

    # async_get_info() ensures the storage collection is loaded before
    # async_items() is read. This prevents overwriting existing resources
    # on Home Assistant versions with lazy resource loading.
    await resources.async_get_info()
    existing = next(
        (
            item
            for item in resources.async_items()
            if urlsplit(item.get("url", "")).path == RESOURCE_PATH
        ),
        None,
    )

    if existing is None:
        await resources.async_create_item(
            {"res_type": "module", "url": versioned_url}
        )
        _LOGGER.info("Registered NBA Center Lovelace resource: %s", versioned_url)
        return

    if existing.get("url") != versioned_url or existing.get("type") != "module":
        await resources.async_update_item(
            existing["id"],
            {"res_type": "module", "url": versioned_url},
        )
        _LOGGER.info("Updated NBA Center Lovelace resource: %s", versioned_url)
    else:
        _LOGGER.debug("NBA Center Lovelace resource is already registered")


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled card and register it with Lovelace automatically."""
    card_path = Path(__file__).parent / "www" / "nba-center-card.js"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(RESOURCE_PATH, str(card_path), False)]
    )
    await _async_register_lovelace_resource(hass)
