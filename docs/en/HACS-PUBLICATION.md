# HACS publication checklist

This document is a release checklist. CI results from older commits must not be treated as validation of the current release commit.

## Previous validation baseline

A previous validation campaign was recorded on commit `bca7f56aa42a3b33c3ce3f98d36856335be0cb55`:

- HACS Action: 10 of 10 checks passed.
- Hassfest: passed.
- Frontend build and Python/JavaScript tests: passed.
- MIT license detected by HACS.
- Local icon present in `custom_components/nba_center/brand/icon.png`.

These results are historical and must be rerun on the commit intended for release.

## Manual checks previously performed

- The repository was added as a HACS custom Integration repository.
- The integration automatically registered the Lovelace resource in Storage mode.
- The `custom:nba-center-ha-card` card loaded on the test Home Assistant instance.
- Installation and operation were checked on a real Home Assistant instance.

Repeat targeted checks after changes to installation, resource loading or the frontend bundle.

## First stable release checklist

- [ ] Confirm `custom_components/nba_center/manifest.json` contains the intended release version.
- [ ] Run Python tests.
- [ ] Run JavaScript tests and rebuild the frontend bundle.
- [ ] Confirm the committed bundle matches frontend sources.
- [ ] Obtain a passing HACS Action run on the release commit.
- [ ] Obtain a passing Hassfest run on the release commit.
- [ ] Verify HACS installation and card loading on a Home Assistant instance.
- [ ] Review release notes and migration requirements.
- [ ] Create GitHub release `v1.0.0` with release notes.
- [ ] Prepare the submission to `hacs/default`, category `integration`, following the current HACS instructions and PR template.

Passing HACS Action and Hassfest are technical prerequisites; they do not guarantee acceptance into the default HACS catalog. Check the current HACS submission instructions before opening the PR.
