Original prompt: ok nice, but the cars spot the moose too fast make the visibility range a bit up. also i think the cars should dodge the moose more and sweep more to the side but on the other lane if possible

Notes:
- Tuned car vision so cars spot the moose later, closer to the road rather than deep in the grass.
- Adjusted dodging to sweep more decisively toward the opposite lane.
- Added render_game_to_text and advanceTime hooks for browser playtest visibility.
- node --check game.js passed.
- Playwright playtest could not launch Chromium because Windows returned spawn EPERM for both headless and headed runs.
- Reduced car dodge sweep speed and opposite-lane pull so evasive movement is less snappy.
- Added mobile joystick markup, CSS, and pointer input mapped into moose movement.
- Re-ran Playwright after mobile changes; Chromium launch is still blocked with spawn EPERM.
- Replaced the generic car sprite with weighted grey/white/black/green/blue/red/yellow/purple car sprites.
- Rotated new car sprites 180 degrees, reduced their draw scale, tightened UI sizing, moved moose spawn closer to the road, added screen padding and lantern blocking, darkened midnight lighting, and brightened car headlights.
- Swapped the old truck path over to weighted van sprites using the existing `grey-van.png`, `white-van.png`, `black-van.png`, and `blue-van.png` assets.
- Brightened the scene again after the last pass went too dark, while keeping it slightly moodier than the initial look.
- Attempted another Playwright visual check, but Chromium still fails to launch here with `spawn EPERM`.
- Restored the lighting stack to the original dark baseline so the playfield is visible again but still night-dark.
- The original dark baseline was still too close to black on the user's fullscreen view; reduced the vignette from near-black and added a visible road base under the texture.
- Fixed the actual blank-screen cause: `resize()` referenced the `const moose` binding before initialization, causing a startup ReferenceError before any canvas drawing could run.
- Darkened the now-working scene with moderate values: stronger vignette and darker road/forest base, but kept the black overlay capped well below the old blank-screen level.
- Added weighted trucks with `red/blue/white/grey/black` and `marlboro/evergreen/debank` truck sprites, plus 75/20/5 car/van/truck spawn odds after the first three forced test spawns.
- Adjusted lighting so grass is brighter while road, trees, lantern glow, and vignette are darker.
- Removed the generic van/truck fallback drawing so only sprite assets appear, flipped left-to-right trucks vertically for readable branded text, and darkened non-grass layers further.
- Reordered forced test spawns to `truck, car, van` and moved the branded truck vertical flip to the opposite lane direction.
- Made truck text flipping lane-specific so upper-lane trucks stay readable without flipping bottom-lane trucks, and reduced the lantern hitbox radius.
- Fixed invisible truck spawns caused by the nonexistent `blue-truck.png` reference; switched that weighted entry to the existing `green-truck.png`.
- Added inventory UI with keyboard/button toggle, wreck loot tables for cars/vans/trucks/special trucks, and low-end weighted rolls for requested item ranges.
- `node --check game.js` passed after inventory changes.
- Attempted Playwright inventory smoke test against the local HTML file; Chromium launch is still blocked by Windows with `spawn EPERM`.
- Updated inventory to use the user's item sprites in a two-column icon grid with count badges.
- `node --check game.js` passed after the visual inventory update; Playwright still cannot launch Chromium due to `spawn EPERM`.
- Removed score and level UI/state; wreck collection now only adds loot, and vehicle spawning/speed no longer depends on hidden level progression.
- Reworked inventory into a centered Stardew-style main menu with tabs and a 24-slot item grid.
- `node --check game.js` passed after the menu inventory update; Playwright still cannot launch Chromium due to `spawn EPERM`.

TODO:
- Playtest car dodge feel and mobile joystick on an actual phone or device emulator once Chromium can launch.
- Re-check final brightness, lantern glow, and van scaling visually in a browser.
- Browser-check the inventory overlay and loot collection flow once Chromium launch is available.
