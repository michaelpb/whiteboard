<wb-start>
    <style scoped>
        x-box {
            align-items: flex-start !important;
        }

        x-box#recent {
            padding-left: 30px;
        }

        h1 {
            font-size: 16pt;
        }
        strong {
            font-weight: bold;
        }

        .info {
            font-size: 10.5pt;
            margin-left: 30px;
            margin-right: 30px;
            margin-top: 30px;
            color: #aaa;
        }

        .starting-button {
            margin-top: 30px;
            min-width: 275px;
        }

        x-box#recent {
            overflow-y: auto !important;
        }
    </style>

    <x-box id="main-box">
        <x-menu opened refs="main_menu">
            <x-menuitem>
                <img src="img/icon.png" class="deck-logo" />
                <x-label>Whiteboard</x-label>
            </x-menuitem>
            <hr>

            <x-menuitem onclick={open_deck}>
                <x-icon name="folder-open"></x-icon>
                <x-label>Open deck...</x-label>
            </x-menuitem>

            <hr>

            <x-menuitem onclick={newDeck}>
                <x-icon name="create-new-folder"></x-icon>
                <x-label>New deck...</x-label>
            </x-menuitem>

            <x-menuitem onclick={import_deck}>
                <x-icon name="folder-special"></x-icon>
                <x-label>Import from directory...</x-label>
            </x-menuitem>

            <hr>

            <x-menuitem onclick={about}>
                <x-icon name="help"></x-icon>
                <x-label>About</x-label>
            </x-menuitem>
        </x-menu>

        <x-box vertical id="recent">
            <x-card if="{ opts.recentDecks.length < 1 }" id="getting_started">
                <main>
                    <div if="{ opts.recentDecks.length < 1 }">
                        <h1>Whiteboard</h1>
                        <p>An activity-based slideshow application for coding
                        webinars, classrooms, or presentations.</p>
                    </div>
                </main>
            </x-card>

            <x-card if="{ opts.recentDecks.length < 1 }">
                <main>
                    <h1>Recent decks</h1>
                    <p><em>No decks yet!</em></p>
                </main>
            </x-card>

            <div if="{ opts.recentDecks.length > 0 }">
                <x-card each={ opts.recentDecks } onclick={open_recent} >
                    <main>
                        <strong>{ path }</strong>
                        <x-box>
                            <div each={slides}>
                                <wb-slide-preview panerows={panerows}>
                                </wb-slide-preview>
                            </div>
                        </x-box>
                    </main>
                </x-card>
            </div>
        </x-box>
    <x-box>

    <script>
        'use strict';

        open_deck() {
            opts.send('menu_open');
        }

        about() {
            opts.send('menu_about');
        }

        newDeck() {
            opts.send('menu_new');
        }

        import_deck() {
            opts.send('menu_import');
        }

        open_recent(ev) {
            ev.preventUpdate = true;
            opts.send('open_recent', ev.item.path);
        }

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
        });
    </script>
</wb-start>
