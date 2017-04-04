<deck>
    <style scoped>
        li.collection-item {
            cursor: default;
        }
    </style>

    <bubble-beam onclick={toggle_deck} if={!opts.pane_visible}>
    </bubble-beam>

    <div class="left-pane brown lighten-4 z-depth-3 animated {slideInLeft: opts.pane_visible} {slideOutLeft: !opts.pane_visible}">
        <div class="left-pane-title">
            <h5><img src="./img/icon.png" height="30px" /> </h5>
            <button onclick={toggle_deck} class="waves-effect waves-brown btn-flat left-pane-close-button">
                <i class="large mdi-navigation-arrow-back"></i>
            </button>
        </div>
        <div class="left-pane-contents">
            <collection>
                <virtual each={item in parent.opts.groups}>
                    <collection-item onclick={parent.parent.toggle}>
                        {item.collapsed ? '▸' : '▾' } <em>{item.label}s</em>
                    </collection-item>
                    <virtual if={!item.collapsed}>
                        <collection-item each={item.objects} active={active} onclick={parent.parent.parent.activate}>
                            &nbsp; &nbsp; &nbsp; {title}
                        </collection-item>
                    </virtual>
                </virtual>
            </collection>
            <!--
            <collection>
                <collection-item each={parent.opts.objects} active={active} onclick={parent.parent.activate}>
                    {title}
                </collection-item>
            </collection>
            -->
        </div>
    </div>
    <div class="right-pane {left-pane-visible: opts.pane_visible}">
        <div id="editor_pane"></div>
    </div>


    <!-- Next and previous controls -->
    <div class="fixed-action-btn hide-without-mouse  {hidden: opts.pane_visible}"
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

    <script>
        toggle(ev) {
            // TODO not sure why its item -> item here...
            ev.preventUpdate = true;
            opts.send('toggle', ev.item.item.typename);
        }

        activate(ev) {
            ev.preventUpdate = true;
            opts.send('activate', ev.item.path);
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
            ev.preventUpdate = true;
            opts.send('toggle_deck');
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
        });
    </script>
</deck>
