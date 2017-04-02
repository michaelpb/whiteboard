# whiteboard

[![Build Status](https://drone.io/bitbucket.org/michaelb/whiteboard/status.png)](https://drone.io/bitbucket.org/michaelb/whiteboard/latest)

-------------------------

Whiteboard is a very simple Electron.js based slideshow app for
demonstration-heavy presentations. It's great for guiding code-heavy classroom
lectures, tutorials, workshops, or presentations.

*Whiteboard is very WIP and not ready for public usage. If you really, really want
to dig in keep on reading.*

## Getting set up

To get a going, follow the following steps:

0. Check out this repo somewhere

1. First, install a recent version of `node.js`, along with a recent version of
npm.
    - The supported version is: `7.8` (same as ran by test server)
    - You might consider using `nvm` to easily install a version that is
      appropriate for your OS and architecture
      https://github.com/creationix/nvm
    - If you used `nvm`, remember to do `nvm use 7` to activate before
      continuing

2. Install dependencies by running `npm install -d`
3. Rebuild binary dependencies against electron by running
`./node_modules/.bin/electron-rebuild`
3. Optionally, double check there's nothing wrong by running the unit tests
with `npm test`

## Auto-generating a slideshow

Whiteboard can auto-generate a slide-deck based on a certain directory
structure. Example directory structure, for a hypothetical tutorial on using
Electron.js:

    electron_slide_show/
        1-Electron_Hello_World/
            hello_world.js
        2-Example_project/
            project/
                package.json
        3-API_usage/
            example.js

This will create a slideshow in alphabetical order. The default slide contains
a text editor (with tabs open for each file), and a bash terminal already
`cd`'ed into the relevant directory.

To auto-generate the slideshow, run:

```
npm run start -- ./electron_slide_show/
```

## Using the GUI

Hit `F1` to bring up a super-imposed UI.

Shortcuts:

* `Ctrl+Shift+[Right Arrow]` next slide
* `Ctrl+Shift+[Left Arrow]` previous slide


## Slideshow file format

Example slideshow:

```
[theme]
css = ./css/theme.css

[slide]
title=POST Request Activity
terminal=./01-POST_Request/
editor=scratch.js, ./01-POST_Request/*.js

[slide]
# comments are ignored
_layout=4x4
title = POST Continued
whiteboard = server_diagram.png
terminal = ./01-POST_Request/
content = text.md

[slide]
title = Example
terminal = ./03-Example/
editor : '''
    ./03-Example/file_01.js
    ./03-Example/file_02.js
'''
content : '''
## This is how you do a POST request

1. Send the request
2. Process the response

[More info](http://babiesfirstpostrequest.info/)
'''
```


