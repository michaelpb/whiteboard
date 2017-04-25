<wb-editor>
    <style scoped>
        .aceeditor-wrapper {
            height: 500px;
        }

        .editor-wrapper {
            height: 100%;
        }

        .editor-wrapper .card-content {
            height: 100%;
        }

        .upper-right-button {
            bottom: 5px;
            right: 0px;
            position: absolute;
        }

        x-tabs {
            max-height: 60px;
        }
    </style>
    <div class="editor-wrapper">
        <x-tabs>
            <virtual each={opts.tabs}>
                <virtual if={active}>
                    <x-tab selected>
                        <x-label>{title}</x-label>
                    </x-tab>
                </virtual>
                <virtual if={!active}>
                    <x-tab onclick={change_tab}>
                        <x-label>{title}</x-label>
                    </x-tab>
                </virtual>
            </virtual>
        </x-tabs>
        <div class="card-content">
            <div ref="editor_node"></div>
        </div>
    </div>


    <script>
        'use strict';
        // Monkeypatch document.createElementNS to get Ace to work. Bizarrely
        // only introduced after upgrading Riot to 3 (as far as I can tell)
        // This is probably the source of the bug:
        // https://github.com/riot/riot/commit/d263e673c19735e32435ae2ec99cc919392dff12
        document.createElementNS = (ns, name) => {
            return document.createElement(name);
        };

        setup_editor(editor_node) {
            const modelist = ace.require("ace/ext/modelist")
            if (!this.editor) {
                this.editor = ace.edit(editor_node);
            }

            if (this.opts.text !== this.editor.getValue()) {
                this.editor.setValue(this.opts.text, 1);
            }
            this.editor.setTheme("ace/theme/monokai");
            this.editor.setOptions({fontSize: "18pt"});
            const mode = modelist.getModeForPath(this.opts.path).mode;
            this.editor.getSession().setMode(mode);
            editor_node.style.height = '90%'; // TODO FIX
            this.editor.resize();

            // Whenever the container resizes, make the term fit
            window.addResizeListener(editor_node, () => {
                editor_node.style.height = '90%'; // TODO FIX
                this.editor.resize();
            });
        }

        change_tab(ev) {
            ev.preventUpdate = true;
            const {active, path} = ev.item;
            this.opts.send('change_tab', this.editor.getValue(), path);
            if (active) {
                // already active, do nothing
            } else {
                this.opts.send('activate', path);
            }
        }

        do_save(ev) {
            if (ev) {
                ev.preventUpdate = true;
            }
            this.opts.send('save', this.editor.getValue());
        }

        this.on('mount', () => {
            const {editor_node} = this.refs;
            console.log('this is eidtoR_node', editor_node);
            this.opts.on('trigger_save', () => this.do_save());
            this.setup_editor(editor_node);
        });

        this.on('update', () => {
            const tabs = this.opts.tabs || ['dummy'];
            const len = Math.floor(12 / (tabs.length || 1));
            const MIN = 1;
            const MAX = 4;
            const col_width = Math.max(Math.min(len, MAX), MIN);
            this.opts.tab_col_class = `s${col_width}`;
        });

        this.on('updated', () => {
            if (this.opts.text != this.editor.getValue()) {
                // update text
                this.editor.setValue(this.opts.text, 1);

                // update syntax highlight mode
                const modelist = ace.require("ace/ext/modelist")
                const mode = modelist.getModeForPath(this.opts.path).mode
                this.editor.getSession().setMode(mode);
            }
        });
    </script>
</wb-editor>
