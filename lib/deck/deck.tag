<wb-deck>
    <style scoped>
        .deck-drawer x-button {
            text-align: center;
            width: 100%;
        }

        .deck-drawer x-button {
            text-align: center;
            width: 100%;
        }

        .deck-drawer-trash-icon {
            opacity: 0.3;
            height: 50%;
            bottom: 25%;
            position: absolute;
            top: 25%;
        }

        .deck-drawer-selected {
            background-color: whiteSmoke;
        }
        #slides_drawer {
            overflow-y: auto;
            overflow-x: hidden;
        }

        #slides_trash {
            height: 50%;
        }

        #slides_trash .deck-drawer-wrapper {
            height:  40px;
        }

        x-button img.deck-svg {
            height: 18px;
            width: 18px;
        }
        x-button img.deck-logo {
            height: 64px;
            width: 64px;
        }

        #help_modal .help-keystroke {
            font-weight: bold;
            min-width: 150px;
        }

        #help_modal .help-info {
            opacity: 0.7;
        }

        #help_modal .help-info img {
            margin: 5px;
        }
    </style>

    <x-drawer id="slides_drawer" position="left" class="deck-drawer">
        <!--
        <x-button onclick={show_settings} skin="textured">
            <img src="img/icon.png" class="deck-logo" />
        </x-button>
        -->

        <x-button skin="textured" onclick={add_slide} class="Deck--add-slide-button">
            <x-box>
                <img src="png/si-glyph-plus.png" />
                <x-label>Slide</x-label>
            </x-box>
        </x-button>
        <div each={opts.slides} onclick={activate} class="deck-drawer-wrapper {deck-drawer-selected: is_active}" data-slideid={id}>
            <wb-slide-preview panerows={panerows}>
            </wb-slide-preview>
        </div>

    </x-drawer>

    <x-drawer id="slides_trash" position="right" class="deck-drawer">
        <img src="svg/si-glyph-trash.svg" class="deck-drawer-trash-icon" />
    </x-drawer>

    <!-- TODO: This help modal is a giant mess! Needs to be generalized 
    and made into an actual component -->
    <x-dialog id="help_modal">
        <main>
            <h4>Help</h4>
            <div id="help_contents"></div>
        </main>
        <footer>
            <x-button skin="flat" onclick={toggle_help}>
                <x-label>Ok</x-label>
            </x-button>
        </footer>
    </x-dialog>

    <div id="current_slide"></div>

    <script>
        'use strict';
        const Sortable = require("sortablejs/Sortable");

        bind_shortcuts(shortcuts) {
            Mousetrap.reset();
            for (let [combos, func] of shortcuts) {
                if (!Array.isArray(combos)) {
                    combos = [combos];
                }

                for (const combo of combos) {
                    // Make mac friendly
                    if (combo.startsWith('ctrl')) {
                        combos.push(combo.replace('ctrl', 'command'));
                    }
                }
                Mousetrap.bind(combos, func);
            }
        }

        setup_shortcuts() {
            this.bind_shortcuts([
                ['ctrl+space', () => opts.send('next_slide')],
                ['ctrl+shift+space', () => opts.send('previous_slide')],
                ['ctrl+enter', () => this.toggle_drawer()],
            ]);
        }

        toggle_help(ev, helpInfo) {
            ev.preventUpdate = true;
            const help = document.getElementById('help_modal');

            // Update the contents of the modal as necessary
            if (!help.opened && helpInfo && Array.isArray(helpInfo)) {
                const contents = [];
                for (const info of helpInfo) {
                    const key = info.accelerator
                        .replace('Or', ' or ')
                        .replace('Command', '\u2318')
                        .replace('Control', 'Ctrl')
                        .replace(/\+/g, ' + ');
                    contents.push(`
                        <x-box>
                            <x-label class="help-keystroke">${key}</x-label>
                            <x-box class="help-info">
                                <img src="${info.icon}" />
                                <x-label>${info.label}</x-label>
                            </x-box>
                        </x-box>
                    `);
                }
                help.querySelector('#help_contents').innerHTML = contents.join('');
            }

            // Actually toggle it
            help.opened = !help.opened;
        }

        toggle_drawer() {
            const drawer = document.getElementById('slides_drawer');
            drawer.opened = !drawer.opened;
        }

        activate(ev) {
            ev.preventUpdate = true;
            opts.send('activate', ev.item.id);
        }

        add_slide(ev) {
            ev.preventUpdate = true;
            opts.send('add_slide');
        }

        next_slide(ev) {
            ev.preventUpdate = true;
            opts.send('next_slide');
        }

        previous_slide(ev) {
            ev.preventUpdate = true;
            opts.send('previous_slide');
        }

        setup_sortable() {
            const drawer = document.getElementById('slides_drawer');
            const trashDrawer = document.getElementById('slides_trash');
            const origHTML = trashDrawer.innerHTML;
            let was_trashed = false;
            const sortable = Sortable.create(drawer, {
                group: 'slides',
                draggable: '.deck-drawer-wrapper',
                dataIdAttr: 'data-slideid',
                onStart: () => {
                    was_trashed = false;
                    slides_trash.opened = true;
                },
                onEnd: () => {
                    if (!was_trashed) {
                        // send reorder event if we didn't just trash a
                        // slide
                        opts.send('reorder', sortable.toArray());
                    }
                    slides_trash.opened = false;
                },
            });
            const sortable2 = Sortable.create(trashDrawer, {
                group: {
                    name: 'trash',
                    put: ['slides'],
                },
                draggable: '.deck-drawer-wrapper',
                dataIdAttr: 'data-slideid',
                onAdd: evt => {
                    was_trashed = true;
                    slides_trash.innerHTML = origHTML;
                    opts.send('set_fewer_slides', sortable.toArray());
                },
            });
        }

        this.on('updated', () => {
            this.setup_sortable();
        });

        this.on('mount', function () {
            document.body.style.background = 'white'; // Hack to fix

            // show main element
            document.getElementById('main').style.display = "block";

            // Set up main crap
            document.body.addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                opts.send('show_context_menu', ev.pageX, ev.pageY);
                return false;
            }, false);

            this.setup_sortable();
            this.setup_shortcuts();

            opts.on('toggle_deck', () => {
                this.toggle_drawer();
            });

            opts.on('toggle_help', (ev, helpInfo) => {
                this.toggle_help(ev, helpInfo);
            });
        });
    </script>
</wb-deck>
