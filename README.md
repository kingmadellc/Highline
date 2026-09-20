# Highline

Catch a wave, find your line, and carry the landing into the next move. **Highline** is a touch-first Unity surfing prototype set in Satellite Beach, Florida, by King Made.

**[Play Highline](https://kingmadellc.github.io/Highline/)** · [Version 0.21.0](https://kingmadellc.github.io/Highline/releases/0.21.0/?v=0.21.0) · [King Made](https://kingmade.co/games/#highline)

[![Highline illustrated key art: a surfer riding a turquoise wave beside the Highline wordmark](releases/0.21.0/Brand/highline.png)](https://kingmadellc.github.io/Highline/)

*Illustrated key art, 1672 × 941. [Open the full-resolution artwork](releases/0.21.0/Brand/highline.png).*

## Play

Use landscape orientation on a phone, or open the game in a desktop browser. The release contains roughly **71 MB of unpacked assets**. GitHub serves the core engine and game data with gzip compression: those three requests total about **23.5 MB** (verified September 15, 2026), before supporting artwork, fonts, and audio. Total transfer varies with browser caching; subsequent visits can reuse cached files.

1. Pull toward yourself and hold to paddle. Release in the timing window to stand.
2. Draw low on the wave to build speed. Approach the lip to ride a high line, or push through the crest to launch.
3. Move sideways in the air to rotate, then release before landing. Keep riding to bank the air and preserve momentum.

Practice a line, catch a wave, or try a three-wave filming set. Learn mode helps released rotations settle; Standard asks for more precise landings.

## Current build

**v0.21.0** answers the first playtest. You now paddle straight in toward the beach with the swell rising behind you, and the pop-up swings the board onto the line. A well-timed release earns a Perfect Drop. The board is a new 6'0" Space Coast shortboard. The rear arm no longer flips during carves. A cutback swings back and carves home instead of spinning full circles. When a shark shows up, it cuts in from the left, crosses to you in full view, and the ride card waits until it has surfaced. v0.20 added the crest stamps. Earlier releases stay available under `releases/`.

This is a browser playtest. Physical-phone performance and controller hardware compatibility remain under evaluation.

## Run this release locally

This repository contains compiled WebGL releases, rather than the editable Unity project. With Git and Python 3 installed:

```sh
git clone https://github.com/kingmadellc/Highline.git
cd Highline
python3 -m http.server 8000
```

Open **http://localhost:8000**. Serve over HTTP instead of opening `index.html` as a local file.

| Path | Purpose |
| --- | --- |
| `index.html` | Entry point for the latest release |
| `releases/0.21.0/` | Versioned game, fonts, audio, and artwork |
| `build-info.json` | Published version, entry point, and exact file hashes |
| `CREDITS.md` | Audio and font attribution |

Versioned directories keep cached game files from different releases separate. Reload an already-open tab after an update.

## Credits and feedback

Created by **King Made**. See [credits](CREDITS.md) for the audio and font sources. Artwork and audio retain their respective rights and license terms; this repository does not declare a general open-source license.

[Report a reproducible issue](https://github.com/kingmadellc/Highline/issues) with the build version, browser, device, and steps to reproduce.
