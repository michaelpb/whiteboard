<wb-title>
    <style scoped>
        h1 {
            font-size: 7vh;
            text-align: center;
        }

        em {
            font-variant: italic !important;
        }
    </style>
    <h1 ref="wrapperNode" class="centered-10vh-when-fullscreen"></h1>

    <script>
        const { setupMediumEditor }  = require('./frontend-utils');
        this.on('updated', () => setupMediumEditor(this, 'limited'));
        this.on('mount', () => setupMediumEditor(this, 'limited'));
    </script>
</wb-title>
