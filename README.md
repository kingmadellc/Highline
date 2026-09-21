# Highline

Catch a wave, find your line, and carry the landing into the next move. **Highline** is a touch-first Unity surfing prototype set in Satellite Beach, Florida, by King Made.

**[Play Highline](https://kingmadellc.github.io/Highline/)** · [Version 0.22.1](https://kingmadellc.github.io/Highline/releases/0.22.1/?v=0.22.1) · [King Made](https://kingmade.co/games/#highline)

[![Highline illustrated key art: a surfer riding a turquoise wave beside the Highline wordmark](releases/0.22.1/Brand/highline.png)](https://kingmadellc.github.io/Highline/)

*Illustrated key art, 1672 × 941. [Open the full-resolution artwork](releases/0.22.1/Brand/highline.png).*

## Play

Use landscape orientation on a phone, or open the game in a desktop browser. The release contains roughly **71 MB of unpacked assets**. GitHub serves the core engine and game data with gzip compression: those three requests total about **23.5 MB** (verified September 15, 2026), before supporting artwork, fonts, and audio. Total transfer varies with browser caching; subsequent visits can reuse cached files.

1. Pull toward yourself and hold to paddle. Release in the timing window to stand.
2. Draw low on the wave to build speed. Approach the lip to ride a high line, or push through the crest to launch.
3. Move sideways in the air to rotate, then release before landing. Keep riding to bank the air and preserve momentum.

Practice a line, catch a wave, or try a three-wave filming set. Learn mode helps released rotations settle; Standard asks for more precise landings.

## Current build

**v0.22.1** finishes the first playtest list and rebuilds the surfer. The rider is now a proper anatomical body with a painted face and sun-bleached hair, in the teal-and-orange trunks and on the red board from the key art. "Let it rip" drops a new player straight onto a guided first wave that teaches one move at a time; afterwards it goes straight to a wave, with the mode menu behind pause. A glowing pocket band under the curl fills a meter that lifts your multiplier live, and Practice has slalom gates. On the lip, a sideways sweep slides the board with the fins free. Late releases drop steep and fast, early ones bury the nose, and a perfect one gets a slow-motion beat. The wave washes out behind the break with set lines rolling in behind it, and the shark announces itself with a low sting. v0.22.1 corrects the name and version the build reports about itself; the game is identical to v0.22.0. v0.21 fixed the shark approach, board, arm flip, paddle-in and cutbacks; v0.20 added the crest stamps. Earlier releases stay available under `releases/`.

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
| `releases/0.22.1/` | Versioned game, fonts, audio, and artwork |
| `build-info.json` | Published version, entry point, and exact file hashes |
| `CREDITS.md` | Audio and font attribution |

Versioned directories keep cached game files from different releases separate. Reload an already-open tab after an update.

## Credits and feedback

Created by **King Made**. See [credits](CREDITS.md) for the audio and font sources. Artwork and audio retain their respective rights and license terms; this repository does not declare a general open-source license.

[Report a reproducible issue](https://github.com/kingmadellc/Highline/issues) with the build version, browser, device, and steps to reproduce.
