# TODO

## Code quality

### Tests

After feature-set settles down:

- [ ] Write e2e tests with lovelock
- [ ] Unit tests for each module

### modular-electron-editor
- [ ] Split off `modular-electron-editor` (contains everything in `lib/`)
- [ ] Add test discovery system
- [ ] Add static resource requirement system (e.g. js + img resources)
- [ ] Re-arrange lib as such:
    * No static or modules directories
    * `lib/` - will be the new `modules` directory
    * `lib/main.js` is the new main, that just calls one function from MEE
    * `lib/modules.json` - as before, contains modules

## Per-app

### Terminal
- [ ] BUG: Error when bash exits (e.g. `Ctrl+D`). Should detect and offer to
  restart.

## Topical

### Appearance
- [ ] Layout engine
- [ ] Auto-fill screen real-estate
- [ ] Borders / optional UI on panels
- [ ] Adjustable font-size
- [ ] Switch UI framework from Materialize?
    * Topcoat looks nice, and more "desktopy": http://topcoat.io/
    * Riot.js is associated with BlazeCSS (already used by RG
      components): http://blazecss.com/
    * Photon, while designed for electron, is mushy gray macOS look:
      http://photonkit.com/

### Tab persistence
- [X] Save state for editor
- [ ] Save state for canvas
- [ ] Save state for browser
- [X] Save state for terminal

### Import dialog
- [ ] Load different module by default if no target is specified
- [ ] Add auto-generate options

# Pipe dreams

## Apps
-  Chemical formula pane (JSME)
-  Physics demos
-  Graphs
-  Embedded media (videos, etc)

