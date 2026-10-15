# Hornets Anthem Release — "Buzz Like Thunder"

A finished, offline "music release" for the **Green Hornets 12U** (Vic's soccer team):
original anthem lyrics, a WebAudio-synthesized track, generated cover art, a karaoke lyric video,
a printable lyric sheet and a share card — all in one self-contained HTML file. No audio files,
no CDN, no network.

Inspired by agentusecases.ai → "produce a finished music release from one chat".

## Run
```bash
./run.sh            # build + start on http://127.0.0.1:4357  (override with HA_PORT)
./run.sh all        # build, screenshots, smoke test, start
./run.sh test       # smoke test only
./run.sh shots      # regenerate screenshots/
./run.sh stop|status|restart
```
Or just open `dist/hornets-anthem.html` (or `dist/index.html`) directly in a browser.

## What's inside
| Tab | What it does |
|---|---|
| **Release** | Canvas cover art (green/black/gold hornet + soccer ball), ⬇ Cover PNG, 🎲 palette remix (Classic / Night Game / Gold Rush), 3-track list (Anthem Mix · Instrumental · Sideline Chant Mix), ⬇ WAV export, liner notes |
| **Lyric Video** | 1280×720 canvas: pulsing honeycomb, flying hornet, stem-driven equalizer, word-by-word gold karaoke synced to the guide melody, title + "GO HORNETS!" end cards, loop toggle, jump-to-chorus, ⏺ record full song to `.webm` (MediaRecorder) |
| **Lyrics** | Printable lyric sheet with chords (toggle), live-line highlight while playing, print CSS (lyric sheet only) |
| **Studio** | 5-stem mixer (drums, bass, chords, lead, buzz FX) with live meters + mute, presets, arrangement strip (click to jump), 16-step pattern view of the current bar |
| **Share Card** | 1080×1350 portrait card (cover + featured chorus line + chant), ⬇ PNG |

## The song
- 128 BPM, G major, 40 bars = **75 s**, loops seamlessly (tails wrap to the top).
- Intro (hornet buzz + title) → Verse 1 → Chorus → Verse 2 → Chorus → Outro chant ("Hornets on three…").
- Original lyrics written for the team; no existing songs, melodies or samples used.
- Every sound is synthesized: sine-sweep kick, noise snares/claps/hats/crash, saw+sub bass,
  detuned saw pads + 16th plucks, square/triangle guide-melody lead (one note per sung word),
  FM-wobble hornet buzz, noise risers and a synthesized crowd "HEY!".
- Rendered with `OfflineAudioContext` in 4-bar segments (≈0.7 s for all 5 stems in headless Chrome),
  then played through per-stem gains → compressor. WAV export = current mix, mono 16-bit 44.1 kHz (~6.6 MB).

## Layout
```
web/{index.html,app.css,app.js}   source
build.py                          inlines web/ → dist/hornets-anthem.html + dist/index.html
server.py                         stdlib server, /healthz, port 4357 (HA_PORT)
run.sh                            build|start|stop|restart|status|shots|test|all
tests/smoke_test.py               offline checks + server + headless Chrome pass (tests/play.mjs)
tests/shots.py                    screenshots via CDP (tests/_shots_run.mjs)
screenshots/00-best-release.png   hero shot
```
Test hook: `window.__HA__` (render, play/pause/seek, lineAt, preview, wavInfo, canvasStats…).


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/hornets-anthem` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
