# TODO

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

### Core API
- [ ] Split off libwhiteboard
- [ ] Split off `modular-electron` (contains everything in `lib/`)
- [ ] Add auto-generate options to libwhiteboard

### Import dialog
- [ ] Load different module by default if no target is specified

# Pipe dreams

## Apps
-  Chemical formula pane (JSME)
-  Physics demos
-  Graphs
-  Embedded media (videos, etc)

