<wb-slide>
    <style>

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
            /*border: 1px solid red;
            border: none;
            box-shadow: 0px 0px 5px #a00;*/
        }

        /* match inner tags, ensure filling up space */
        div.slide-outer-pane {
            height: 100%;
            display: block;
            box-sizing: border-box;
            float: left;
        }

        .slide-outer-pane > div,
        .slide-outer-pane > div > * {
            height: 100%;
            min-height: 100%;
            display: block;
            box-sizing: border-box;
        }

        div.slide-row {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            clear: both;
        }
    </style>

    <div each={opts.pane_rows} style="height: {height}vh;" class="slide-row">
        <div each={row_panes} style="width: {width}vw;" class="slide-outer-pane">
            <!-- Generate mount points for each pane contents -->
            <div id="{mount_id}"
                    onmouseenter={trigger_gain_focus}
                    onkeyup={trigger_gain_focus}
                    onclick={trigger_gain_focus}>
            </div>
        </div>
    </div>

    <script>
        'use strict';

        let last_focus = null;
        trigger_gain_focus(ev) {
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
            this.opts.on('toggle_maximized_pane', toggle_maximized_pane);
        });

        this.on('updated', () => {
            // If there was an update that reflowed things, we need to
            // remount the editors
            if (this.opts._needs_remount) {
                this.opts.send('remount_editors');
            }
        });
    </script>
</wb-slide>

<wb-slide-preview>
    <style>
        :scope {
            display: inline-block;
            height: 200px;
            width: 240px;
            margin: 20px;
            padding: 5px;
            text-align: center;
            box-sizing: border-box;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        }

        /* match inner tags, ensure filling up space */
        div.slide-preview-pane {
            height: 100%;
            display: block;
            box-sizing: border-box;
            float: left;
            overflow: hidden;
        }

        div.slide-preview-row {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            clear: both;
            overflow: hidden;
        }

        .slide-preview-title {
            font-size: 24pt;
        }
        img {
            height: 100%;
            width: 100%;
            background: 1px solid gray;
        }
    </style>
    <div each={opts.panerows} style="height: {height}%;"  class="slide-preview-row">
        <div each={row_panes} style="width: {width}%;" class="slide-preview-pane">
            <!-- Generate mount points for each pane contents -->
            <raw html={preview}></raw>
        </div>
    </div>
</wb-slide-preview>

