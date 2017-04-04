<browser>
    <style scoped>
        webview {
            display:inline-flex;
            width: 100%;
            /*min-height: 50vh;*/
            height: 100%;
        }

        .browser-wrapper {
            height: 100%;
        }
        .browser-wrapper .card-content {
            height: 100%;
        }
    </style>

    <div class="browser-wrapper card blue-grey darken-1 z-depth-4">
        <div class="card-content white-text">
            <!--<span class="card-title">{opts.url}</span>-->
            <webview src="{opts.url}"></webview>
        </div>
    </div>

    <script>
        'use strict';
        // Essential: prevent default update in browser
        this.on('update', ev => {
            //opts.url;
            //ev.preventUpdate = true;
        });
    </script>
</browser>
