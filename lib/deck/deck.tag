<wb-deck>
    <style scoped>
        li.collection-item {
            cursor: default;
        }
    </style>

    <!--<bubble-beam onclick={toggle_deck}></bubble-beam>-->

    <x-drawer id="slides_drawer" position="left">
        <x-box each={opts.slides}>
            <x-card onclick={activate}>
                <span if={is_active}>
                    XXX
                </span>
                &nbsp; &nbsp; &nbsp; {title}
            </x-card>
        </x-box>
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
        activate(ev) {
            ev.preventUpdate = true;
            opts.send('activate', ev.item.id);
        }

        next_slide(ev) {
            ev.preventUpdate = true;
            console.log('next slide');
            opts.send('next_slide');
        }

        previous_slide(ev) {
            ev.preventUpdate = true;
            console.log('prevoius slide');
            opts.send('previous_slide');
        }

        toggle_deck(ev) {
            document.getElementById('slides_drawer').opened = true;
        }

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

            opts.on('toggle_deck', () => {
                const deck = document.getElementById('slides_drawer');
                deck.opened = !deck.opened;
            });
        });
    </script>
</wb-deck>
