

const { ModuleBase } = require('elmoed');

class Browser extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.setup_events();
        callback();
    }

    setup_events() {
        this.on('navigation', (event, url) => {
            this.text = url;
        });

        this.on('navigation_force', (event, url) => {
            this.text = url;
            this.parentEditor.set_pane_value('browser', url);
        });
    }

    serialized() {
        return this.text;
    }

    static get_iconic_preview(text) {
        return '<img src="svg/si-glyph-globe.svg"/>';
    }

    getProps() {
        return { url: this.text };
    }
}

module.exports = Browser;
