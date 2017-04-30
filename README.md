# whiteboard

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
`./node_modules/.bin/electron-rebuild` (or just `npm run rebuild`)
3. ~Optionally, double check there's nothing wrong by running the unit tests
with npm test~

## Running

1. Create a file called `test_whiteboard.cfg`:

    [slide]
    title = Terminal and editor
    editor : ./testfile.js
    terminal = ./


2. Run `npm run start -- test_whiteboard.cfg` to launch


# Slideshow file format

Example slideshow:

        [slide]
        title=POST Request Activity
        terminal=./01-POST_Request/
        editor=scratch.js, ./01-POST_Request/*.js

        [slide]
        # comments are ignored
        title = POST Continued
        terminal = ./01-POST_Request/

        [slide]
        title = Example
        terminal = ./03-Example/
        editor : '''
            ./03-Example/file_01.js
            ./03-Example/file_02.js
        '''
        markdown : '''
        ## This is how you do a POST request

        1. Send the request
        2. Process the response

        [More info](http://babiesfirstpostrequest.info/)
        '''


