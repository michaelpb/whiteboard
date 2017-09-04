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
            min-width: 200px;
            margin-right: 30px;
            margin-top: 2px;
            margin-left: 2px;
        }

        x-box#recent {
            overflow-y: auto !important;
            max-height: 90vh;
        }
    </style>

    <div>
        <x-box>
            <x-button class="starting-button" onclick={open_deck}>
                <x-icon name="folder-open"></x-icon>
                <x-label>Open deck...</x-label>
            </x-button>

            <x-button class="starting-button" onclick={newDeck}>
                <x-icon name="create-new-folder"></x-icon>
                <x-label>New deck...</x-label>
            </x-button>

            <x-button class="starting-button" onclick={import_deck}>
                <x-icon name="folder-special"></x-icon>
                <x-label>Import from directory...</x-label>
            </x-button>
        </x-box>

        <x-box vertical id="recent">
            <x-card if="{ opts.recentDecks.length < 1 }" id="getting_started">
                <main>
                    <div if="{ opts.recentDecks.length < 1 }">
                        <h1>Whiteboard</h1>
                        <p>An activity-based slideshow application for coding
                        webinars, classrooms, or presentations.</p>

                        <p><strong>Hint:</strong> Get going by either starting
                        from scratch by clicking <strong>&ldquo;New
                        deck&rdquo;</strong>, OR importing a directory
                        containing a series of subdirectories, which will be
                        interpreted as a series of activities by clicking
                        <strong>&ldquo;Import from
                        directory&rdquo;</strong>.</p>

                        <p>Once created, all controls will be available via
                        context menu (<em>Right click</em> or
                        <em>Command + Click</em>)

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
                <x-card each={ opts.recentDecks } onclick={open_recent} title="{ path }">
                    <main>
                        <strong>{ filename }</strong>
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
    </div>

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
