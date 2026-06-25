# Release Channel Policy

## Purpose

This project uses two release channels:

- `main`: manager acceptance and daily integration
- `gh-pages`: public player release

The goal is to keep player-facing GitHub Pages stable while allowing ongoing work and review on `main`.

## Branch Roles

`main`

- Default branch for normal development work
- First landing place for UI adjustments, copy updates, and maintenance changes
- Used by managers for acceptance review before release

`gh-pages`

- Public player-facing release branch
- Treated as the actual shipped version
- Updated only after explicit manager approval

## Release Rule

Default push target is `main`.

Do not push changes to `gh-pages` as part of ordinary development.

Only push to `gh-pages` when both are true:

1. The manager has reviewed the `main` version.
2. The manager has explicitly agreed to release.

## Entry Policy

Public player entry:

- `https://nkko-nc.github.io/-_-/`

Maintenance-only entry:

- `https://nkko-nc.github.io/-_-/entry-friendly.html`

The entry-friendly route is retained for maintenance and acceptance use only.
It should not be treated as a public onboarding link in README or release-facing copy.

## Expected Workflow

1. Make and review changes on `main`.
2. Perform manual acceptance on `main`.
3. Wait for explicit manager release approval.
4. Promote the approved state to `gh-pages`.

## Notes

- `gh-pages` is the player-facing source of truth.
- `main` may be newer than `gh-pages` between releases.
- This difference is expected and should not be treated as a deployment mistake by itself.
