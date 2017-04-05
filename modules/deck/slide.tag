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
    </style>

    <div each={opts.pane_rows} class="row {row_panes.length === 1 ? 'single-row' : 'double-row'} {row_class}">
        <div each={row_panes}
            class="outer-pane col {column_class}"
            style={row_style}>
            <!-- Generate mount points for each pane contents -->
            <div id="{mount_id}"></div>
        </div>
    </div>

    <!--
        <script>
            this.on('updated', () => {
            });
            this.on('mount', () => {
            });
        </script>
    -->
</slide>
