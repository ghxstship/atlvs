# GHXSTSHIP Scripts Directory

This is the canonical location for all repository automation scripts.

Structure

- Top-level scripts: Primary, maintained entry points used by package.json and CI.
- apps/web/scripts/: App-scoped utilities (e.g., OpenAPI generation) that are specific to the web app.
- _from_root-YYYYMMDD-HHMMSS/: Timestamped import of unique scripts from the previous root-level scripts directory for reference and migration. These are not wired into CI yet.
- _conflicts-YYYYMMDD-HHMMSS/: If any script names existed in both locations with different contents, both versions and a .diff are placed here for manual review.

Usage

- Package.json references these scripts via ./scripts/*
- GitHub Actions workflows in .github/workflows/ call ./scripts/* within the ghxstship/ repo root

Guidelines

- Add new repo-wide scripts here (not in the workspace root).
- Keep app-specific helpers under apps/web/scripts/.
- Prefer idempotent, non-interactive scripts suitable for CI.
- Document new scripts with a short header (purpose, usage, pre-reqs).

Migration Notes

- On 2025-09-21, unique scripts from the workspace root scripts/ were copied into _from_root-20250921-175845/ for consolidation.
- No conflicting duplicates were detected; 2 scripts were identical and already present here.
- Once validated, useful scripts from _from_root-*/ can be promoted into the top-level of this directory and wired into package.json or CI as needed.
