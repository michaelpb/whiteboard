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

        table {
            border-spacing: 10px;
            border-collapse: separate;
        }

        table td {
            background-color: rgba(127, 127, 127, 0.4);
        }

        table td {
            padding: 3px;
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


        li,
        li p,
        pre {
            text-align: left;
        }

        td {
            padding: 5px;
            text-align: left;
            font-size: 22pt;
        }

        table {
            display: inline-block;
            min-width: 40vh;
        }

        ul > li {
            list-style: disc outside none;
        }

        ol > li {
            list-style: decimal outside none;
        }

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
