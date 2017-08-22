# TODO

## Top Priority

### Critical bugs
- [ ] BUG: Rare bug where code editor stops working somehow
- [ ] BUG: Rare bug where maximize stops working

### Appearance
- [X] Upgrade to latest Xel
- [ ] Debug Xel Vanilla/Galaxy theme issues
    - [ ] Change form material to Vanilla

### Code quality
- [X] Clean up unused packages
- [X] Upgrade package versions
- [ ] Remove use of deprecated functions
- [ ] Add linting rules

### Checklist
- [X] Title
- [ ] Code editor
    - [ ] BUG: Can't "Save as" after creating new tab
- [ ] Terminal
- [ ] Markdown

### Saving/loading features
- [X] Blank state
    - should work if running without any arguments
    - half-assed solution: default to "new file" in tmp directory, maybe..?
- [X] Add/remove panel
- [X] Edit panel
    - [X] Edit title (can even be "prompt")
    - [X] Add or remove editor tabs
    - [X] Edit markdown (simple textbox (?))
- [ ] Save & Save As
- [ ] Load
- [ ] Load directory (import)


### Packaging
- [ ] Move to GitHub
- [ ] Win/Lin/Mac
- [ ] Filetype associations


### High-Prio Nice to Haves
- [ ] "Blow-up"
    - Simpler solution to "whiteboard" annotations: Like shutter, select an
      area of the screen to create a blowup (creates and saves a png image).
      This allows for parts of the presentation to be focused on, and
      annotated, and the annotations to be "returnable", e.g. one important
      part of code or a website could be blown up and then diagrammed.
    - [ ] Blowups can be created (selecting screen area)
    - [ ] Blowups are stored in a top-level "blowups" editor (at the same level
      as slides)
    - [ ] A slide-editor like interface can drop in from the right to select
      blow ups
    - [ ] They can be viewed and drawn on (1 simple marker for now)

```
[blowup]
background = _wb_blowups/01_fg.png
foreground = _wb_blowups/01_bg.png

```


## Code quality

### Tests

After feature-set settles down:

- [X] Rework code of slide system: Deck.js should be less abstract, more
  practical
- [X] Write e2e tests with spectron
- [ ] Improve e2e tests to properly shutdown PTY
- [X] Unit tests for each module
    - [X] Deck
    - [X] Editor
    - [ ] Terminal
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

- [X] Returning to slide with Editor breaks tabs
    - When switching to a new slide, then switching back again editor tabs will
      no longer work, and instead flicker on and off again the wrong tab
- [X] Seemingly randomly, after some use, toggling maximization will do it for
  the wrong pane
    - Probably fixed..?


## Per-app


### Terminal
- [ ] BUG: Error when bash exits (e.g. `Ctrl+D`). Should detect and offer to
  restart.
- [ ] BUG: When window is closed, bash still keeps on running in background.
    - Solution: Add feature to elmoed that keeps track of all editors per
      window, then trigger cleanup for all editors on window close, and kill
      child processes.

### Editor
- [X] BUG: Too many tabs becomes unusable


## Topical

### Deck editing
- [X] Add slide
- [X] Add pane
- [X] Delete slide
- [X] Delete pane
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
- [ ] Drag n drop re-arrange panes

### Appearance
- [X] Slide preview generator
- [X] Remember window state (maybe https://github.com/mawie81/electron-window-state)
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
- [X] Save as
- [X] Open new tabs
- [X] Close tabs
- [X] Zero state
- [ ] "Autosave" option

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
- Finished browser that maintains state
- Draw on top of any pane
- Zip-based file format
