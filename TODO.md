# Next steps

1. Spin off MEE, and improve code quality + documentation
2. Rework code of slide system: Deck.js should be less abstract, more practical
3. Auto-save changes in slideshow file
4. Create new slides
5. Add new panes
6. Zero state: create new deck or use recent
7. Drag n drop for quickly assembly slide decks

# TODO

## Code quality

### Tests

After feature-set settles down:

- [ ] Write e2e tests with lovelock
- [ ] Unit tests for each module

### modular-electron-editor
- [x] Split off `modular-electron-editor` (contains everything in `lib/`)
- [x] Add test discovery system
- [x] Add static resource requirement system (e.g. js + img resources)
- [x] Re-arrange lib as such:
    * No static or modules directories
    * `lib/` - will be the new `modules` directory
    * `lib/main.js` is the new main, that just calls one function from MEE
    * `lib/modules.json` - as before, contains modules

## Per-app

### Terminal
- [ ] BUG: Error when bash exits (e.g. `Ctrl+D`). Should detect and offer to
  restart.

### Slide
- [ ] Pipedream: Draw on top
- [ ] Pipedream: Add pane (need to clean up editor system)

## Topical

### Appearance
- [ ] Layout engine
- [X] Auto-fill screen real-estate
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


## Editor
- [X] Autodetect filetype
- [X] Support glob syntax for loading

## New full right click menu

### Contextual right click
- [X] Keep track of "focused" pane (focus follows mouse, clicks, keyup)
- [X] Full screen pane CSS (`z-index: 1000; top: 0; left 0; height: 100vh;
  width: 100vh;`)
- [X] Save (`Ctrl+S`)

### Global right click
- [X] All old actions
- [X] Switch to horizontal, vertical, or grid layout (|| = or ::)

# Pipe dreams

## Apps
-  Chemical formula pane (JSME)
-  Physics demos
-  Graphs
-  Embedded media (videos, etc)

