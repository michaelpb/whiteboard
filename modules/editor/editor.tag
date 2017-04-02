<editor>
    <style scoped>
        .aceeditor-wrapper {
            height: 500px;
        }
    </style>
    <material-tabs useLine="true" tabs="{opts.tabs}"></material-tabs>

    <div each={opts.files} id='EDITME'>
        {contents}
    </div>

    <script>
        'use strict';
        var editor;
        this.on('mount', () => {
            editor = ace.edit("EDITME");
            editor.setTheme("ace/theme/monokai");
            editor.getSession().setMode("ace/mode/javascript");
            $('#EDITME').height(100); // TODO FIX
            editor.resize();
        });
        this.on('updated', () => {
            $('#EDITME').height(100); // TODO FIX
            editor.resize();
        });
    </script>
</editor>
