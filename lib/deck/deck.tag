<wb-deck>
    <style scoped>
        li.collection-item {
            cursor: default;
        }

        .deck-drawer x-button {
            text-align: center;
            width: 100%;
        }

        .deck-drawer {
            overflow-y: auto;
            overflow-x: hidden;
            text-align: center;
        }

        .deck-drawer-selected {
            background-color: whiteSmoke;
        }

        x-button img {
            height: 18px;
            width: 18px;
        }
    </style>

    <!--<bubble-beam onclick={toggle_deck}></bubble-beam>-->

    <x-drawer id="slides_drawer" position="left" class="deck-drawer">
        <x-button onclick={add_slide}>
            <x-box>
                <img src="svg/si-glyph-plus.svg" />
                <x-label>Slide</x-label>
            </x-box>
        </x-button>
        <div each={opts.slides} onclick={activate} class="deck-drawer-wrapper {deck-drawer-selected: is_active}" data-slideid={id}>
            <wb-slide-preview panerows={panerows}>
            </wb-slide-preview>
        </div>
    </x-drawer>

    <div id="editor_pane"></div>

    <!-- Next and previous controls -->
    <!--
    <div class="right-pane">
        <div id="editor_pane"></div>
    </div>
    <div class="fixed-action-btn hide-without-mouse {hidden: opts.pane_visible}"
            style="left: 10px; top: 10px;">
        <a class="btn-floating btn-large brown lighten-1" onclick={previous_slide}>
            <i class="large mdi-navigation-arrow-back"></i>
        </a>
    </div>

    <div class="fixed-action-btn hide-without-mouse {hidden: opts.pane_visible}"
            style="right: 10px; top: 10px;">
        <a class="btn-floating btn-large brown lighten-1" onclick={next_slide}>
            <i class="large mdi-navigation-arrow-forward"></i>
        </a>
    </div>
    -->

    <script>
        'use strict';
        const Sortable = require("sortablejs/Sortable");
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

        toggle_deck(ev) {
            document.getElementById('slides_drawer').opened = true;
        }

        setup_sortable() {
            const drawer = document.getElementById('slides_drawer');
            const sortable = Sortable.create(drawer, {
                draggable: '.deck-drawer-wrapper',
                dataIdAttr: 'data-slideid',
                onEnd: () => {
                    opts.send('reorder', sortable.toArray());
                },
            });
        }

        this.on('updated', () => {
            this.setup_sortable();
        });

        this.on('mount', function () {
            document.body.style.background = 'white'; // Hack to fix
            document.getElementById('splash').remove(); // delete splash

            // show main element
            document.getElementById('main').style.display = "block";

            // Set up main crap
            document.body.addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                opts.send('show_context_menu', ev.pageX, ev.pageY);
                return false;
            }, false);

            this.setup_sortable();
            const drawer = document.getElementById('slides_drawer');
            opts.on('toggle_deck', () => {
                drawer.opened = !drawer.opened;
            });
        });
    </script>
</wb-deck>
