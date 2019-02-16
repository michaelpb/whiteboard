<wb-editor>
    <style scoped>
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
            height: 60px;
            overflow-x: auto;
        }
    </style>
    <div class="editor-wrapper">
        <x-tabs>
            <virtual each={opts.tabs}>
                <virtual if={active}>
                    <x-tab selected>
                        <x-label>
                            <virtual if={edited}>
                                &bull;
                            </virtual>
                            {title}
                        </x-label>
                    </x-tab>
                </virtual>
                <virtual if={!active}>
                    <x-tab onclick={change_tab}>
                        <x-label>
                            <virtual if={edited}>
                                &bull;
                            </virtual>
                            {title}
                        </x-label>
                    </x-tab>
                </virtual>
            </virtual>
        </x-tabs>
        <div class="editor-actual-node" ref="editor_node"></div>
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
            //this.editor.setTheme("ace/theme/solarized_light");
            //this.editor.setTheme("ace/theme/monokai");
            this.editor.setTheme("ace/theme/xcode");
            this.editor.setOptions({fontSize: "28pt"});
            const mode = modelist.getModeForPath(this.opts.path).mode;
            this.editor.getSession().setMode(mode);

            // Disable some annoying auto-complete features
            this.editor.setOptions({
                enableBasicAutocompletion: false,
                enableSnippets: false,
                enableLiveAutocompletion: false,
                showFoldWidgets: false,
                behavioursEnabled: false,
                highlightActiveLine: true,
            });

            editor_node.style.height = 'calc(100% - 60px)';
            this.editor.resize();

            // Whenever the container resizes, make the term fit
            window.addResizeListener(editor_node, () => {
                editor_node.style.height = 'calc(100% - 60px)';
                this.editor.resize();
            });
        }

        change_tab(ev) {
            ev.preventUpdate = true;
            const {active, path} = ev.item;
            this.opts.send('change_tab', this.editor.getValue(), this.opts.path, path);
        }

        do_save(ev, is_saveas) {
            if (ev) {
                ev.preventUpdate = true;
            }
            // console.log('Doing save');
            const name = is_saveas ? 'saveas' : 'save';
            clear_bullet();
            this.opts.send(name, this.editor.getValue());
        }

        function clear_bullet() {
            // TODO: remove all bullets from titles
        }

        function add_bullet() {
            // TODO: add a bullet to the current title
        }

        this.on('mount', () => {
            const {editor_node} = this.refs;
            this.opts.on('trigger_save', () => this.do_save());
            this.opts.on('trigger_save_as', () => this.do_save(null, true));
            this.setup_editor(editor_node);
        });

        this.on('updated', () => {
            // Set font size
            const fontSize = `${this.opts.font_size}pt`;
            this.editor.setOptions({fontSize});

            // Set theme (light or dark)
            if (this.opts.theme === 'light') {
                this.editor.setTheme("ace/theme/xcode");
            } else {
                this.editor.setTheme("ace/theme/monokai");
            }

            if (this.opts.text != this.editor.getValue()) {
                // update text
                this.editor.getSession().setValue(this.opts.text, -1);
            }

            // update syntax highlight mode, always
            const modelist = ace.require("ace/ext/modelist")
            const mode = modelist.getModeForPath(this.opts.path).mode
            this.editor.getSession().setMode(mode);
        });
    </script>
</wb-editor>
