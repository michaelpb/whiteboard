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

        .pane-fullscreen .centered-10vh-when-fullscreen {
            padding-top: 45vh;
            font-size: 10vh;
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

        #slide_pane_editor x-textarea {
            font-size: 2vw;
        }

        #slide_pane_editor x-textarea {
            height: calc(90vh - 140px);  /* include h4  + footer */
        }

        #slide_pane_editor main {
            height: calc(90vh - 70px);
        }

        #slide_pane_editor footer {
            height: 70vh;
        }

        #slide_pane_editor {
            width: 90vw;
            height: 90vh;
        }
    </style>

    <div each={opts.pane_rows} style="height: {height}vh;" class="slide-row">
        <div each={rowPanes} style="width: {width}vw;" class="slide-outer-pane">
            <!-- Generate mount points for each pane contents -->
            <div id="{mountID}"
                    data-typename="{typename}"
                    onmouseenter={trigger_gain_focus}
                    onkeyup={trigger_gain_focus}
                    onclick={trigger_gain_focus}>
            </div>
        </div>
    </div>


    <!-- TODO: The pane editor is a giant mess! Should be in its own tag. Also
    should be much more user friendly. -->
    <x-dialog id="slide_pane_editor">
        <main>
            <h4></h4>
            <x-textarea value="" onkeyup={trigger_pane_editor_enable_save}></x-textarea>
        </main>

        <footer>
            <x-button class="cancel_button" skin="flat" onclick={trigger_pane_editor_cancel}>
                <x-label>Cancel</x-label>
            </x-button>

            <x-button disabled toggled class="save_button" skin="flat" onclick={trigger_pane_editor_save}>
                <x-label>Save</x-label>
            </x-button>
        </footer>
    </x-dialog>

    <script>
        'use strict';

        let last_focus = null;
        let last_edited = null;
        trigger_gain_focus(ev) {
            ev.preventUpdate = true;

            const mountID = ev.item.mountID;
            if (last_focus === mountID) {
                // Skip triggering excess focus events
                return;
            }

            // Add the focus class to the current element
            if (last_focus !== null) {
                const el = document.getElementById(last_focus);
                if (el) {
                    // window.log('last focus was not null, but invalid nonetheless', last_focus);
                    el.classList.remove('pane-focused');
                }
            }
            last_focus = mountID;
            const el = document.getElementById(mountID);
            el.classList.add('pane-focused');
            // window.log('focusing on ' + mountID);

            // Send the change focus event to the backend
            this.opts.send('change_focus', mountID);
        }

        trigger_pane_editor_enable_save(ev) {
            ev.preventUpdate = true;
            const editor_modal = document.querySelector('#slide_pane_editor');
            editor_modal.querySelector('.save_button').disabled = false;
        }

        trigger_pane_editor_cancel(ev) {
            ev.preventUpdate = true;
            const editor_modal = document.querySelector('#slide_pane_editor');
            editor_modal.opened = false;
        }

        trigger_pane_editor_save(ev) {
            ev.preventUpdate = true;
            const editor_modal = document.querySelector('#slide_pane_editor');
            var value = editor_modal.querySelector('x-textarea').value;
            // send the save event to the backend
            const typename = last_edited;
            this.opts.send('edit_panel_save', {value, typename});
            var value = editor_modal.querySelector('x-textarea').value;
            editor_modal.opened = false;
            editor_modal.querySelector('.cancel_button').disabled = "disabled";
            editor_modal.querySelector('.save_button').disabled = "disabled";
        }

        function unedit_pane() {
            const editor_modal = document.querySelector('#slide_pane_editor');
            editor_modal.opened = false;
        }

        function edit_pane(ev, opts) {
            // Toggling on current focus
            const {value, typename} = opts;
            const editor_modal = document.querySelector('#slide_pane_editor');
            editor_modal.querySelector('h4').textContent = typename;
            editor_modal.querySelector('x-textarea').value = value;
            editor_modal.querySelector('.save_button').disabled = "disabled";
            editor_modal.querySelector('.cancel_button').disabled = false;
            editor_modal.opened = true;

            // Remember which one we are editing
            last_edited = typename;
        }

        function clear_special_classes() {
            const panes = document.querySelectorAll('.pane-fullscreen');
            for (const pane of panes) {
                pane.classList.remove('pane-fullscreen');
                pane.classList.remove('pane-focused');
            }
        }

        function maximize_pane(ev, pane_mountID) {
            // Toggling on current focus
            clear_special_classes();
            const el = document.getElementById(pane_mountID);
            if (!el) {
                console.error('Could not find "' + pane_mountID + '"');
                return;
            }
            el.classList.add('pane-fullscreen');
        }

        this.on('mount', () => {
            this.opts.on('maximize_pane', maximize_pane);
            this.opts.on('unmaximize_pane', clear_special_classes);
            this.opts.on('edit_pane', edit_pane);
            this.opts.on('unedit_pane', unedit_pane);
            if (this.opts.maximizedPane) {
                maximize_pane({}, this.opts.maximizedPane);
            }
        });

        this.on('updated', () => {
            // If there was an update that reflowed things, we need to
            // remount the editors
            if (this.opts._needs_remount) {
                this.opts.send('remount_editors');
            }
            if (this.opts.maximizedPane) {
                maximize_pane({}, this.opts.maximizedPane);
            }
        });
    </script>
</wb-slide>

<wb-slide-preview>
    <style>
        :scope {
            display: inline-block;
            height: 150px;
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
        <div each={rowPanes} style="width: {width}%;" class="slide-preview-pane">
            <!-- Generate mount points for each pane contents -->
            <raw html={preview}></raw>
        </div>
    </div>
</wb-slide-preview>

