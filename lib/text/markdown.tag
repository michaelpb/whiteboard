<wb-markdown>
    <style scoped>
        :scope {
            font-size: 100%;
            overflow-y: scroll;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        :scope {
            color: #444;
            /*font-size: 16px;*/
            font-size: 4vmin;
            line-height: 1.5em;
            padding: 1em;
            /*
            margin: auto;
            max-width: 42em;
            */
            /*background: #fefefe;*/
        }

        img, video {
            max-width: 100%;
            max-height: 100%;
        }

        em, i {
            font-variant: italic !important;
        }

        strong, b {
            font-weight: bold !important;
        }

        /*
        @media only screen and (min-width: 480px) {
            :scope {
                font-size: 14px;
            }
        }

        @media only screen and (min-width: 768px) {
            :scope {
                font-size: 16px;
            }
        }
        */
    </style>

    <div ref="wrapperNode"></div>

    <script>
        const { setupMediumEditor, handleInsert }  = require('./frontend-utils');

        this.on('updated', () => setupMediumEditor(this));
        this.on('mount', () => {
            this.opts.on('insert', (ev, html) => handleInsert(this.editor, html));
            setupMediumEditor(this);
        });
    </script>
</wb-markdown>
