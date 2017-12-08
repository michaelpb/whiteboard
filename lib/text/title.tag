<wb-title>
    <style scoped>
        h1 {
            font-size: 7vh;
            text-align: center;
        }
    </style>
    <h1 class="centered-10vh-when-fullscreen">{opts.text}</h1>

    <div ref="wrapperNode"></div>

    <script>
        const { setupMediumEditor }  = require('./frontend-utils');
        this.on('updated', () => setupMediumEditor(this));
        this.on('mount', () => setupMediumEditor(this));
    </script>
</wb-title>
