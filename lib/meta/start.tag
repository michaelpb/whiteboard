<wb-start>
    <style scoped>
        h1,
        h2,
        p { 
            color: black !important;
        }

        x-box {
            align-items: flex-start !important;
        }

        h1 {
            font-size: 18pt;
        }
        h2 {
            font-size: 14pt;
            font-weight: 400;
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

        p {
            margin-top: 10px;
        }

        p em {
            font-variant: italic;
        }

        #buttons {
            margin-top: 30px;
        }

        .starting-button {
            min-width: 200px;
            margin-right: 30px;
            margin-top: 4px;
            margin-left: 4px;
            width: 100%;
        }

        #recent {
            padding-left: 30px;
        }
    </style>

    <x-box>
        <div id="buttons">
            <x-button class="starting-button" skin="textured" onclick={open_help}>
                <x-icon name="help"></x-icon>
                <x-label>Help</x-label>
            </x-button>

            <x-button class="starting-button" skin="textured" onclick={newDeck}>
                <x-icon name="create-new-folder"></x-icon>
                <x-label>New deck</x-label>
            </x-button>

            <x-button class="starting-button" skin="textured" onclick={open_deck}>
                <x-icon name="folder-open"></x-icon>
                <x-label>Open deck</x-label>
            </x-button>
        </div>

        <div id="recent">
            <x-box vertical>
                <x-card>
                    <main>
                        <h1>Whiteboard</h1>
                        <h2>Pre-release {opts.version}</h2>
                        <p>An activity-based slideshow application for coding
                        webinars, classrooms, or presentations.</p>

                        <p>
                            <a href="http://whiteboard.michaelb.org/">
                                Check the site for updates
                            </a>
                        </p>
                    </main>
                </x-card>
            </x-box>
        </div>
    </x-box>

    <script>
        'use strict';

        open_help() {
            opts.send('menu_help');
        }

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
