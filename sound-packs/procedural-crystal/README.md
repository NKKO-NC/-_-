# Procedural Crystal Sound Pack

Independent synthetic audio pack for the Kalah project.

This pack is intentionally not wired into the game runtime. It can be copied,
validated, or loaded by a future audio/theme layer without changing the game
rules engine.

## Contents

- `generate-pack.ps1` - deterministic procedural synthesizer.
- `audio/*.wav` - generated PCM WAV files.
- `manifest.json` - sound-pack metadata, schema-style event mapping, and hashes.
- `checksums.sha256` - SHA-256 checksum list for generated WAV files.
- `SOUND_LICENSE.md` - source and commercial-use notes.

## Sound Direction

- BGM: slow, stable major-key four-chord loop with airy pads and occasional
  wind-chime-like random accents.
- Stone sounds: crystal and glass-like pickup/drop/collision tones.
- UI sounds: short low wooden taps for standard buttons.
- Outcomes: crystal victory upbeat, defeat downbeat, and draw chord.

## Regenerate

From the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\sound-packs\procedural-crystal\generate-pack.ps1
```

The generator uses only Windows PowerShell/.NET standard APIs and does not
download dependencies.

## Runtime Integration Notes

Suggested event keys:

- `music.game`
- `stone.pickup`
- `stone.drop.pit`
- `stone.drop.store`
- `stone.collision`
- `stone.capture`
- `turn.extra`
- `turn.change`
- `coin.toss`
- `ui.button`
- `ui.invalid`
- `result.victory`
- `result.defeat`
- `result.draw`

Use the `manifest.json` event map as the contract for a future audio layer.
