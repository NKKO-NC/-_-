# Release Channel Policy

## Purpose

This project uses two release channels:

- `main`: manager acceptance test channel
- `gh-pages`: public player release channel

The goal is to keep the player-facing version stable while allowing managers to review a newer executable build before release.

## Active Entry Points

Manager test build:

- `https://rawcdn.githack.com/NKKO-NC/-_-/main/index.html`

Player release build:

- `https://nkko-nc.github.io/-_-/`

## Branch Roles

`main`

- Default branch for ongoing development
- First landing place for copy, UI, and maintenance changes
- Source branch for manager acceptance
- Expected to be newer than `gh-pages` between releases

`gh-pages`

- Player-facing release branch
- Treated as the actual shipped version
- Updated only after explicit manager approval

## Release Rule

Default push target is `main`.

Do not push ordinary development changes directly to `gh-pages`.

Only promote to `gh-pages` when both are true:

1. The manager has reviewed the `main` test build.
2. The manager has explicitly agreed to release.

## Expected Workflow

1. Make changes on `main`.
2. Review the executable `main` test build.
3. Perform manager acceptance.
4. Release the approved state to `gh-pages`.

## Notes

- `main` is the manager test version.
- `gh-pages` is the player version.
- A difference between `main` and `gh-pages` is expected before release.
- Legacy onboarding or maintenance-only routes may remain in the codebase, but they are not part of the public release-channel documentation.
