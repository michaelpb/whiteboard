<browser>
    <style scoped>
        webview {
            display:inline-flex;
            width: 100%;
            min-height: 50vh;
        }
    </style>

    <!-- disable-x-frame-options is a cool thing built into Electron that bypasses security -->

    <div class="card blue-grey darken-1">
        <div class="card-content white-text">
            <!--<span class="card-title">{opts.url}</span>-->
            <webview id="foo" src="{opts.url}"></webview>
        </div>
    </div>

    <script>
        'use strict';
        this.on('mount', () => {
        });
    </script>
</browser>
