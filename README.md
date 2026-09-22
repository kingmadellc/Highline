# Highline

Catch a wave, find your line, and carry the landing into the next move. **Highline** is a touch-first Unity surfing prototype set in Satellite Beach, Florida, by King Made.

**[Play Highline](https://kingmadellc.github.io/Highline/)** · [Version 0.26.0](https://kingmadellc.github.io/Highline/releases/0.26.0/?v=0.26.0) · [King Made](https://kingmade.co/games/#highline)

[![Highline illustrated key art: a surfer riding a turquoise wave beside the Highline wordmark](releases/0.26.0/Brand/highline.png)](https://kingmadellc.github.io/Highline/)

*Illustrated key art, 1672 × 941. [Open the full-resolution artwork](releases/0.26.0/Brand/highline.png).*

## Current playtest: 0.26.0

**[Play Highline 0.26.0](https://kingmadellc.github.io/Highline/releases/0.26.0/?v=0.26.0)** on your phone in landscape or in a desktop browser. The main Play Highline link opens this same release.

A coordinated surfing polish pass: rail-driven spray and landing water, connected whole-body motion, deeper wave shading, smoother cameras, immediate next-wave actions, refined beach atmosphere, and better recorded magazine photographs.

Verified integrated WebGL build and 392 production browser assertions, including small-screen layouts, audio controls, replay isolation, and pixel-identical cover save/reload/export. Paired desktop rendering performance remains effectively unchanged from 0.25.1. Formal human playtests and physical-phone validation remain deferred.
## Play

Use landscape orientation on a phone, or open the game in a desktop browser. Allow the initial game download to finish, then select **Let it rip**. Subsequent visits can reuse cached assets.

1. Make quick paddle strokes with the swell, then hold the final stroke. Release in the green timing window to stand.
2. Draw low on the wave to build speed. Approach the lip to ride a high line, or push through the crest to launch.
3. Move sideways in the air to rotate, then release before landing. Keep riding to bank the air and preserve momentum.

Practice a line, catch a wave, or try a three-wave filming set. Learn mode helps released rotations settle; Standard asks for more precise landings.

## Earlier builds

**[v0.25.1](https://kingmadellc.github.io/Highline/releases/0.25.1/?v=0.25.1)**

This update brings recorded water into the surf: ocean and shoreline ambience, board glide and loaded turns, varied spray and landings, and a distinct barrel wash. Paddle splashes follow the animated hands meeting the water. The barrel sound follows actual wave coverage, while pause, mute, menus, and replay silence the affected layers. [Sound credits](releases/0.25.1/credits.html).

All existing surfing, natural arm balance, focused practice, Free Surf, magazine covers, wave challenges, and replay features remain available. From a ride, use **Pause → Beach menu → Surf club** to explore the modes.

The package grew about 2.1 MB to 77.1 MB of unpacked build content; actual transfer depends on hosting compression and caching. The paired desktop frame-time sample was unchanged. Physical-phone listening, sustained performance, and player enjoyment remain playtest questions. Earlier versioned builds stay available.


**v0.23.2** promotes Rhythm paddling into the normal game, varies the ideal stand-up moment between waves, opens more rideable space in the flats, and makes riding over the back an intentional sustained-line exit. Lip grinds now last at most 2.6 seconds, permit one style switch, and require a one-second fins-set recovery before another grind. The rider’s screen-left arm now follows the moving body with a lower, softer elbow and aligned wrist instead of lagging or lifting into a chicken-wing pose. Everything below from v0.23.1 is included.

**v0.23.1** fills the lineup with a distinct cast: seven men and three women, each with their own build, hair, swimwear and board, with repeats kept apart. Everything below from v0.23.0 is included.

**v0.23.0** combines three streams of work into one update. The ocean has more life: a long fishing pier on the beach that comes into view as the wave carries you in, boats beyond the break (a camera boat pacing you, anchored skiffs, a sailboat and a shrimp trawler), gulls that come and go in singles and loose Vs, lineup surfers sitting on their boards, a fourth wave forming outside and set lines that grow and feather as they reach shallow water. Every wave now has its own character: a thicker or softer lip, lighter or heavier whitewater, a clean or sectiony break, and a shoulder that crumbles into foam and fades instead of running on forever. The shark is new: it stalks with its fin up, drops out of sight, then breaches under you jaws-first and drags you under, leaving your board floating. Air now needs a deliberate pop, lip grinds snap in, switch and snap out, with-motion 360s are easier than against-motion ones, the carve band covers more of the face, and the replay keeps your whole ride with a clear end. The paddle-in has a new experimental timing layer. v0.22.1 corrected the build identity; v0.22 added the pocket meter, guided first wave and board slide. Earlier releases stay available under `releases/`.

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
| `releases/0.25.1/` | Versioned game, fonts, audio, and artwork |
| `build-info.json` | Published version, entry point, and exact file hashes |
| `CREDITS.md` | Audio and font attribution |

Versioned directories keep cached game files from different releases separate. Reload an already-open tab after an update.

## Credits and feedback

Created by **King Made**. See [credits](CREDITS.md) for the audio and font sources. Artwork and audio retain their respective rights and license terms; this repository does not declare a general open-source license.

[Report a reproducible issue](https://github.com/kingmadellc/Highline/issues) with the build version, browser, device, and steps to reproduce.
