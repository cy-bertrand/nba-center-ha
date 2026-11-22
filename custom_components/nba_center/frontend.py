"""Frontend resources for the NBA Center Lovelace card."""
from __future__ import annotations

import logging
from pathlib import Path
from urllib.parse import urlsplit

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

RESOURCE_PATH = "/nba-center-ha/nba-center-card.js"
RESOURCE_URL = RESOURCE_PATH



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

    integration = await async_get_integration(hass, DOMAIN)
    versioned_url = f"{RESOURCE_PATH}?v={integration.version}"

    # async_get_info() ensures the storage collection is loaded before
    # async_items() is read. This prevents overwriting existing resources
    # on Home Assistant versions with lazy resource loading.
    await resources.async_get_info()
    matching_resources = [
        item
        for item in resources.async_items()
        if urlsplit(item.get("url", "")).path == RESOURCE_PATH
    ]
    existing = matching_resources[0] if matching_resources else None

    # Multiple resources pointing to the same custom element can cause an
    # older bundle to register the element first. The newer bundle then skips
    # customElements.define(), leaving the old implementation active.
    for duplicate in matching_resources[1:]:
        await resources.async_delete_item(duplicate["id"])
        _LOGGER.warning(
            "Removed duplicate NBA Center Lovelace resource: %s",
            duplicate.get("url", RESOURCE_PATH),
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
