# TODO

## Top Priority

### Critical regressions
- [X] BUG: Editing Markdown pane does not work (shows no modal)
- [X] BUG: Completely broke re-arranging slides

### Critical bugs
- [X] BUG: Rare bug: Maximize stops working after switching slides
- [X] BUG: Rare bug: Code editor stops working somehow (possibly fixed?)
- [X] BUG: Code editor: Can't "Save as" after creating new tab

### Appearance
- [X] Upgrade to latest Xel

### Code quality
- [X] Clean up unused packages
- [X] Upgrade package versions
- [X] Get E2E testing working again
    - [X] Get travis E2E working
- [X] More E2E tests
- [ ] Test coverage
- [ ] Remove use of deprecated dependencies
- [X] Linting
    - [X] Add linting rules
    - [X] Apply to lib
    - [X] Apply to spec
- [ ] Unit tests for each module
    - [X] Deck
    - [X] Editor
    - [X] Terminal
    - [X] Slide
        - [ ] Panel editor
    - [X] Browser
    - [X] Markdown
    - [X] Title

### Basic apps working
- [X] Title
- [X] Code editor
    - [X] Req'd feature: quick and dirty adjust font-size
- [X] Terminal
    - [X] Req'd feature: quick and dirty adjust font-size & remount
- [X] Markdown

### Saving/loading features
- [X] Blank state
    - should work if running without any arguments
- [X] Add/remove panel
- [X] Edit panel
    - [X] Edit title (can even be "prompt")
    - [X] Add or remove editor tabs
    - [X] Disable editor for Code Editor and Terminal
    - [X] Edit markdown (simple textbox (?))
- [X] Load
- [X] Each app stores and recalls state
    - [X] Title
    - [X] Markdown
    - [X] Code editor
    - [X] Terminal

### Quality of life
- [ ] New menu system
    - [X] Lower level utilities to set this up
    - [X] Hardcoded mousetrap alternative cmds to unblock full E2E tests
    - [ ] Mousetrap (Blocked on Elmoed): Blocking: full E2E tests
    - [X] Separate right click menu
    - [ ] More fleshed out global menu
- [ ] Auto-save for Whiteboard (on by default)
    - [ ] Save to settings file..?
- [ ] Code editor (off by default)
    - [ ] Save to settings file..?
- [X] Elmoed: Remember window state
- [ ] Browser
    - [ ] Add refresh option (Ctrl+R)
    - [ ] For file:///, do auto-refresh

New right click menu structure:

```
-> Next 
<- Previous
=  All slides
[] Fullscreen
[] Maximize Editor
   Editor...
      [X] Autosave
          Save
          Save as
          ----
          Open
          Close tabs
          ----
          Modify
          Delete pane
   Slide...
        Insert Pane...
        Pane arrangement
```

Alternative idea (semi-radial menu, that if you move while releasing it selects
for "gestures"):

    ^
<-    ->



### Packaging
- [X] Move to GitHub
- [X] Lin
- [X] Mac
- [X] Win
- [ ] Filetype associations

### high-prio system-specific bugs
- [ ] auto-generation on windows is broken
- [ ] terminal on windows is broken

### High-Prio Nice to Haves
- [X] Add Help menu option with about window:
  https://github.com/rhysd/electron-about-window
- [ ] Add key combo help overlay (can just be a modal)
  that contains all actions listed out
- [X] Web browser (remember location)
    - [X] Basic mounting of web page
    - [X] For now, just remember location between changing slides
    - (Later, try to squirrel away entire DOM state)
- [X] Save & Save As
- [X] Import directory

## High prio bugs
- [ ] Elmoed (?) bug: Editors are getting created EVERY TIME we swap slides (at
  least for browser)
    - This is probably memory leakage, and possibly some sort DOM leakage where
      slides aren't getting properly destroyed :(

## Medium prio nice-to-have
- Gobal theme options
    - [ ] Global adjustable font-size
    - [ ] Global color scheme (light-on-dark or dark-on-light)
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
- [ ] Debug Xel Vanilla/Galaxy theme issues
    - [ ] Change form material to Vanilla

## Code quality

### Tests

After feature-set settles down:

- [X] Rework code of slide system: Deck.js should be less abstract, more
  practical
- [X] Write e2e tests with spectron

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
- [X] Add "import" dialog that can temporarily (or save) change default
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
- Zip-based file format (elmoed feature)



## Blocked
- [X] Add a couple more E2E tests
    - Need to move away from system-level control key codes, to in-browser key
      code detection, since its too hard to simulate interaction
- [ ] Improve e2e tests to properly shutdown PTY
    - Can't repro (?)

# Drawing implementation ideas

- Route 1: Have "side deck" of slides
    - alternate = true
    - Blow-up tool automatically makes a side slide that contains 1 pane:
        - Drawable image pane
        - image-canvas = ./blowups/whatever.png
- Route 2: Make all slides drawable

