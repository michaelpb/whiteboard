# Development

If you just want to use Whiteboard, then download a
[pre-built binary](http://whiteboard.michaelb.org/). If you want to contribute,
then read on.

* [Whiteboard development Code of Conduct](CONDUCT.md)

Contributions are welcome, and they are greatly appreciated! Every
little bit helps, and credit will always be given.

You can contribute in many ways:

# Reporting bugs

Report bugs at https://github.com/michaelpb/whiteboard/issues

If you are reporting a bug, please include:

* Your operating system name and version.
* Any details about your local setup that might be helpful in troubleshooting.
* Detailed steps to reproduce the bug.

# Fix bugs

Look through the GitHub issues for bugs. Anything tagged with "bug"
and "help wanted" is open to whoever wants to implement it.

# New features, such as a new pane type

Envision Whiteboard to be the most general-purpose interactive slide-show app
available! With that in mind, have a practical idea for what Whiteboard should
support?  The best way to send feedback is to file an issue at
https://github.com/michaelpb/whiteboard/issues

If you are proposing a feature:

* Explain in detail how it would work.
* Keep the scope as narrow as possible, to make it easier to implement.
* Remember that this is a volunteer-driven project, and that contributions are
  welcome :)

Adding a new pane or content type to Whiteboard is always welcome!  Look
through the GitHub issues for features. Anything tagged with "enhancement" and
"help wanted" is open to whoever wants to implement it.

# Getting started

If you want to contribute to Whiteboard, then follow the following steps:

1. Fork the `michaelpb/whiteboard` repo on GitHub.

2. Clone your fork locally, something like: `git clone git@github.com:your_name_here/whiteboard.git

3. Install a recent version of `node.js`, along with a recent version of
npm.
    - The supported version is: `8.4` (same as ran by test server)
    - You might consider using `nvm` to easily install a version that is
      appropriate for your OS and architecture
      https://github.com/creationix/nvm
    - If you used `nvm`, remember to do `nvm use 8` to activate before
      continuing

4. Install dependencies by running `npm install -d` - On good connections this
will take about a minute

5. Rebuild binary dependencies against electron by running: `npm run rebuild`


4. Create a branch for local development: `git checkout -b name-of-your-bugfix-or-feature`

5. When you're done making changes, check that your changes pass `eslint` and
the tests:
    - `make lint`
    - `npm run test-e2e` -- run unit tests and end-to-end tests
    - If you are on Linux and have `xvfb` you can run `npm run test-headless`
      to run the end to end tests headlessly

6. Commit your changes and push your branch to GitHub.

7. Submit a pull request through the GitHub website.

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

