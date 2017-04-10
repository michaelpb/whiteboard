<slide>
    <style scoped>
        .outer-pane {
            /*font-size: 10vmin;*/
        }
        .row.single-row {
            min-height: 10vh;
            height: 10vh;
        }

        .row.double-row {
            min-height: 85vh;
            height: 85vh;
        }

        .row.slide-row-half {
            height: 42vh;
        }

        /* match inner tags, ensure filling up space */
        .outer-pane > div,
        .outer-pane > div > * {
            height: 100%;
            width: 100%;
            min-height: 100%;
            min-width: 100%;
            display: block;
        }

        div.outer-pane.col {
            height: 100%;
            display: block;
        }

        /* Full screen pop-up above everything */
        .pane-fullscreen {
            display: block;
            z-index: 1000;
            position: absolute;
            left: 0;
            top: 0;
            height: 100vh;
            width: 100vw;
            background: white;
        }

        /* Pane is getting focused */
        /* For debugging: */
        .pane-focused {
            border: 1px solid red;
            /*border: none;*/
        }
    </style>

    <div each={opts.pane_rows} class="row {row_panes.length === 1 ? 'single-row' : 'double-row'} {row_class}">
        <div each={row_panes}
            class="outer-pane col {column_class}"
            style={row_style}>
            <!-- Generate mount points for each pane contents -->
            <div id="{mount_id}"
                    onmouseenter={trigger_gain_focus}
                    onkeyup={trigger_gain_focus}
                    onclick={trigger_gain_focus}
                ></div>
        </div>
    </div>

    <script>
        'use strict';

        let last_focus = null;
        trigger_gain_focus (ev) {
            ev.preventUpdate = true;

            const mount_id = ev.item.mount_id;
            if (last_focus === mount_id) {
                // Skip triggering excess focus events
                return;
            }

            // Add the focus class to the current element
            if (last_focus !== null) {
                const el = document.getElementById(last_focus);
                el.classList.remove('pane-focused');
            }
            last_focus = mount_id;
            const el = document.getElementById(mount_id);
            el.classList.add('pane-focused');
            window.log('focusing on ' + mount_id);

            // Send the change focus event to the backend
            this.opts.send('change_focus', mount_id);
        }

        let current_max_pane = null;
        function toggle_maximized_pane() {
            if (current_max_pane === null) {
                // Toggling on current focus
                current_max_pane = last_focus;
                const el = document.getElementById(current_max_pane);
                el.classList.add('pane-fullscreen');
            } else {
                // Toggling off
                const el = document.getElementById(current_max_pane);
                el.classList.remove('pane-fullscreen');
                current_max_pane = null;
            }
        }

        this.on('mount', () => {
            this.opts.on_ipc('toggle_maximized_pane', toggle_maximized_pane);
        });

        this.on('updated', () => {
            // If there was an update that reflowed things, we need to
            // remount the editors
            if (this.opts._needs_remount) {
                this.opts.send('remount_editors');
            }
        });
    </script>
</slide>
