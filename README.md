# whiteboard

![Travis CI](https://travis-ci.org/michaelpb/whiteboard.svg?branch=master)

![Build status](https://ci.appveyor.com/api/projects/status/kecjxg5h613ivbwd?svg=true)](https://ci.appveyor.com/project/michaelpb/whiteboard)

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
    - The supported version is: `8.x` (same as ran by test server)
    - You might consider using `nvm` to easily install a version that is
      appropriate for your OS and architecture
      https://github.com/creationix/nvm
    - If you used `nvm`, remember to do `nvm use 8` to activate before
      continuing

2. Install dependencies by running `npm install -d` - On good connections this
will take about a minute

3. Rebuild binary dependencies against electron by running: `npm run rebuild`

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


# Building


## Troubleshooting

Building on Ubuntu:
> libreadline.so.6 cannot open shared object file

https://github.com/electron-userland/electron-builder/issues/993

```
sudo apt-get install -y xorriso
export USE_SYSTEM_XORRISO=true
```

