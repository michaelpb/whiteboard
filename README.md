# whiteboard

-------------------------

Whiteboard is a Electron.js based slideshow app for demonstration-heavy
presentations. It's great for guiding code-heavy classroom lectures, tutorials,
workshops, or presentations.

**Whiteboard is very WIP and not ready for public usage. If you really, really want
to dig in keep on reading.**


## Pre-built packages

- Since Whiteboard is a WIP, there are no pre-built packages at this time!

## Development

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
    - On slower connections and computers this could take a while: as long as
      10 minutes
3. Rebuild binary dependencies against electron by running
`./node_modules/.bin/electron-rebuild` (or just `npm run rebuild`)
3. Optionally: double check there's nothing wrong by running the test suite
with `npm run test`, or `npm run test-headless` (if you have `xvfb` installed)

4. Run `npm run start` to launch

Try running
`npm run start -- ./spec/support/data/dev-example-file/ks.whiteboard`
to launch loading an example file

# Slideshow file format

## Single slide

```
[slide]
title = Terminal and editor
editor : ./testfile.js
terminal = ./
```


## Multiple slides

```
[slide]
title=POST Request Activity
terminal=./1-POST_Request/
editor=scratch.js, ./1-POST_Request/*.js

[slide]
# comments are ignored
title = POST Continued
terminal = ./1-POST_Request/

[slide]
title = Example
terminal = ./3-Example/
editor : '''
    ./3-Example/file_01.js
    ./3-Example/file_02.js
'''
markdown : '''
## This is how you do a POST request

1. Send the request
2. Process the response

[More info](http://babiesfirstpostrequest.info/)
'''
```

