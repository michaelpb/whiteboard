<deck>
    <style scoped>
        li.collection-item {
            cursor: pointer;
        }
    </style>

    <bubble-beam onclick={toggle_deck} if={!opts.pane_visible}>
    </bubble-beam>

    <div class="left-pane z-depth-3 animated {slideInLeft: opts.pane_visible} {slideOutLeft: !opts.pane_visible}">
        <div class="left-pane-title">
            <h5>Deck</h5>
            <button onclick={toggle_deck} class="waves-effect waves-teal btn-flat left-pane-close-button">
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
    <script>
        document.body.style.background = 'white'; // Hack to fix

        toggle(ev) {
            // TODO not sure why its item -> item here...
            opts.send('toggle', ev.item.item.typename);
        }
        activate(ev) {
            opts.send('activate', ev.item.path);
        }
        toggle_deck(ev) {
            window.log('togglin');
            opts.send('toggle_deck');
        }
    </script>
</deck>
