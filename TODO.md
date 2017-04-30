# TODO

## Code quality

### Tests

After feature-set settles down:

- [X] Rework code of slide system: Deck.js should be less abstract, more
  practical
- [X] Write e2e tests with spectron
- [ ] Improve e2e tests to properly shutdown PTY
- [X] Unit tests for each module
    - [ ] Deck
    - [X] Slide

### modular-electron-editor
- [X] Split off `modular-electron-editor` (contains everything in `lib/`)
- [X] Add test discovery system
- [X] Add static resource requirement system (e.g. js + img resources)
- [X] Re-arrange to lib
    * No static or modules directories
    * `lib/` - will be the new `modules` directory
    * `lib/main.js` is the new main, that just calls one function from MEE
    * `lib/modules.json` - as before, contains modules

## Critical bugs

Two extremely critical bugs persist:

- [ ] Returning to slide with Editor breaks tabs
    - When switching to a new slide, then switching back again editor tabs will
      no longer work, and instead flicker on and off again the wrong tab
- [ ] Seemingly randomly, after some use, toggling maximization will do it for
  the wrong app


## Per-app


### Terminal
- [ ] BUG: Error when bash exits (e.g. `Ctrl+D`). Should detect and offer to
  restart.

### Editor
- [ ] BUG: Too many tabs becomes unusable, needs a "More v" button with full
  list or something


## Topical

### Deck editing
- [X] Add slide
- [X] Add pane
- [ ] Delete slide
- [ ] Delete pane
- [ ] Edit pane
- [ ] Drag-and-drop auto-creation
    - Top-level folders turn into slides
    - Recurse down and files become various panes (based on mimetype)
- [ ] Add "import" dialog that can temporarily (or save) change default
  behavior (maybe combine with the Deck-level options..?)
- Option dialog (separate window...?):
    - [ ] Deck-level options window (theme, default layout)
    - [ ] Slide-level options window (layout ?)
    - [ ] Pane-level options window (per-editor options)
- [X] Zero state: new deck
- [ ] Drag n drop re-arrange panels and/or slides

### Appearance
- [X] Slide preview generator
- [ ] Remember window state: https://github.com/mawie81/electron-window-state
- [X] Layout engine
- [X] Auto-fill screen real-estate
- [X] Switch UI framework from Materialize (switched to Xel)
- Gobal theme options
    - [ ] Global adjustable font-size
    - [ ] Global color scheme (light-on-dark or dark-on-light)

### Tab persistence
- [X] Save state for editor
- [X] Save state for terminal


## Editor
- [X] Autodetect filetype
- [X] Support glob syntax for loading

## Misc
- [ ] Add Help menu option with about window:
  https://github.com/rhysd/electron-about-window

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
- Chemical formula pane (JSME)
- Physics demos
- Graphs
- Embedded media (videos, etc)
- Finish browser that maintains state
- Draw on top of any pane
- Zip-based file format
