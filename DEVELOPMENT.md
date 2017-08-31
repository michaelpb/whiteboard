# Development

If you just want to use Whiteboard, then download a
[pre-built binary (once available)](README.md).

* [Whiteboard development Code of Conduct](CONDUCT.md)

# Setting up

If you want to contribute to Whiteboard, then follow the following steps:

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

4. Optionally: double check there's nothing wrong by running the test suite
with `npm run test-e2e`, or, if you have `xvfb` installed `npm run
test-headless`.

5. Run `npm run start` to launch

Try running
`npm run start -- ./spec/support/data/kitchen-sink/ks.whiteboard`
to launch loading an example file used by end-to-end tests.

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


# Building to binary packages

## Troubleshooting

Building on Ubuntu:
> libreadline.so.6 cannot open shared object file

https://github.com/electron-userland/electron-builder/issues/993

```
sudo apt-get install -y xorriso
export USE_SYSTEM_XORRISO=true
```

