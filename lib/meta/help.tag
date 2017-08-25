<wb-start>
    <style scoped>
        x-box {
            align-items: flex-start !important;
        }

        /*
        x-box#recent {
            padding-left: 30px;
        }
        */

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
        <!--
        <x-menu opened>
            <x-menuitem>
                <img src="img/icon.png" class="deck-logo" />
                <x-label>Whiteboard</x-label>
            </x-menuitem>
            <hr>

            <x-menuitem>
                <x-icon name="folder-open"></x-icon>
                <x-label>Open deck...</x-label>
            </x-menuitem>

            <hr>

            <x-menuitem>
                <x-icon name="create-new-folder"></x-icon>
                <x-label>New deck</x-label>
            </x-menuitem>

            <x-menuitem>
                <x-icon name="folder-special"></x-icon>
                <x-label>Import from directory</x-label>
            </x-menuitem>

            <hr>

            <x-menuitem>
                <x-icon name="help"></x-icon>
                <x-label>About</x-label>
            </x-menuitem>
        </x-menu>
        -->

        <x-box vertical id="recent">

            <!--<x-card if="{ opts.recentDecks.length < 1 }" id="getting_started">-->
            <x-card id="getting_started">
                <main>
                    <div if="{ opts.recentDecks.length < 1 }">
                        <h1>Whiteboard</h1>
                        <p>An activity-based slideshow application for coding
                        webinars, classrooms, or presentations.</p>
                    </div>

                    <x-box vertical>

                        <x-box>
                            <x-button class="starting-button" skin="textured">
                                <x-icon name="create-new-folder"></x-icon>
                                <x-label>
                                    New blank deck
                                </x-label>
                            </x-button>

                            <x-label>
                                <p class="info">
                                Choose a directory in which to start from
                                scratch with an empty deck.  From here you can
                                manually add slides.
                                </p>
                            </x-label>
                        </x-box>


                        <x-box>
                            <x-button class="starting-button" skin="textured">
                                <x-icon name="folder-special"></x-icon>
                                <x-label>
                                    Import from directory
                                </x-label>
                            </x-button>


                            <x-label>
                                <p class="info">
                                Start from a directory containing many other
                                directories, each representing one slide in
                                your presentation. Code files will be
                                automatically opened in appropriate panes, and
                                the directory names themselves will serve as
                                titles.
                                </p>
                            </x-label>
                        </x-box>

                        <hr />

                        <x-box>
                            <x-button class="starting-button" skin="textured">
                                <x-icon name="folder-special"></x-icon>
                                <x-label>
                                    Open...
                                </x-label>
                            </x-button>


                            <x-label>
                                <p class="info">
                                Open a previously saved slide show.
                                </p>
                            </x-label>
                        </x-box>

                        <x-box>
                            <x-button class="starting-button" skin="textured">
                                <x-icon name="help"></x-icon>
                                <x-label>
                                    About
                                </x-label>
                            </x-button>

                            <x-label>
                                <p class="info">
                                    .
                                </p>
                            </x-label>
                        </x-box>

                    </x-box>
                </main>
            </x-card>

            <x-card if="{ opts.recentDecks.length < 1 }">
                <main>
                    <h1>Recent decks</h1>
                    <p><em>No decks yet!</em></p>
                </main>
            </x-card>


            <x-card if="{ opts.recentDecks.length > 0 }">
                <main>
                    <h1>Recent decks</h1>

                    <x-button skin="textured" each={ opts.recentDecks }>
                        <x-icon name="view-carousel"></x-icon>
                        <x-label>{ path }</x-label>
                    </x-button>
                </main>
            </x-card>


        </x-box>
    <x-box>

    <script>
        'use strict';
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

            const drawer = document.getElementById('slides_drawer');
            opts.on('toggle_deck', () => {
                drawer.opened = !drawer.opened;
            });
        });
    </script>
</wb-start>
