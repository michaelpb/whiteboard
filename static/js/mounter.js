'use strict';
const riot = require('riot');
const IPCStream = require('electron-ipc-stream');

function append_html(el, str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    while (div.children.length > 0) {
        if (div.children[0].tagName === 'LINK') {
            // Create an actual link element to append later
            const style = document.createElement('link');
            style.href = div.children[0].href;
            style.rel = div.children[0].rel;
            style.type = div.children[0].type;
            // append your other things like rel, type, etc
            el.appendChild(style);
        }
        el.appendChild(div.children[0]);
    }
}

class Mounter {
    constructor(ipc) {
        this.ipc = ipc;

        // Set up incoming mount event
        this.ipc.on('mount:editor', (event, payload) => {
            // const {tagname, prefix, path, opts, selector} = payload;
            this.mount(payload.tagname, payload.prefix, payload.path,
                payload.opts, payload.selector, payload.html_head);
        });
    }

    old_ready(ipc) {
        let workspace_tag;

        // const spinner = require('riot-mui/src/material-elements/material-spinner/material-spinner.tag');
        ipc.on('scrollworkspace:initial_mount', (event, payload) => {
            workspace_tag = require('../modules/workspace/workspace.tag');
            const opts = JSON.parse(payload.opts || '{}');
            const path = payload.path || '';
            const prefix = payload.prefix || '';
            opts.send = (channel, ...args) => {
                console.log("sending along channel", channel);
                ipc.send(`${prefix}${channel}`, ...args);
            };

            //riot.mount(workspace_tag, opts);
            riot.mount(workspace_tag, opts);
        });

        ipc.on('scrollworkspace:update', (event, payload) => {
            console.log('receiving update requires');
            workspace_tag.update(payload);
        });
    }

    ready() {
        // Ready to mount front-end components
        ipc.send('mount:ready');
    }

    mount(tagname, prefix, tag_path, opts, selector, html_head) {
        opts = JSON.parse(opts || '{}');
        let tag_instance;

        // Up 2 directories since we are in static/js
        const full_path = `../../${tag_path}`;
        const riot_tag = require(full_path);

        const prep_opts = opts => {
            // Set up outgoing channel
            opts.send = (channel, ...args) => {
                ipc.send(`${prefix}${channel}`, ...args);
            };

            // Set up incoming channel
            opts.on_ipc = (channel, callback) => {
                this.ipc.on(`${prefix}${channel}`, callback);
            };

            // Helper function to create a wrapped IPC for streaming interface
            opts.get_ipc_stream = (channel) => {
                return new IPCStream(`${prefix}${channel}`);
            };
        };

        // Set up incoming channels
        this.ipc.on(`${prefix}update`, (event, payload) => {
            const opts = JSON.parse(payload);
            prep_opts(opts);
            tag_instance.opts = opts;
            tag_instance.update(opts);
        });

        const mount_location = document.querySelector(selector);
        if (!mount_location) {
            throw new Error('Could not find mount location: ' + selector);
        }

        if (html_head && html_head.length > 1) {
            const head_node = document.querySelector('head');
            if (head_node.innerHTML.indexOf(html_head) === -1) {
                // Not inserted yet, append
                console.log('this is desired', html_head);
                append_html(head_node, html_head);
            }
        }

        const id = `mount_spot_${tagname}`;
        const faux_tags = `<${tagname} id="${id}"></${tagname}>`;

        // Clear inner html (maybe later fade out first?)
        mount_location.innerHTML = '';

        // Add in the HTML in the right location for riot to find
        mount_location.innerHTML = faux_tags

        // Finally, mount the element where it belongs
        prep_opts(opts);
        tag_instance = riot.mount(`#${id}`, opts)[0];

        // And send a 'ready' event so the main process knows
        opts.send('ready');
    }
}

module.exports = Mounter;
