<wb-help>
    <style scoped>
        div#scroller {
            padding: 10vh;
            min-height: 100vh;
            min-width: 100vw;
            height: 100vh;
            width: 100vw;
            box-sizing: border-box;
            overflow-y: scroll;
        }

        h1 {
            font-size: 18pt;
        }

        h2 {
            font-size: 14pt;
            font-weight: 400;
        }

        strong {
            font-weight: bold;
        }

        p {
            margin-top: 10px;
        }

        p em {
            font-variant: italic;
        }

        x-button {
            display: inline-block;
            max-height: 1em !important;
        }
    </style>

    <div id="scroller">
        <h1>Getting started</h1>
        <p>Each presentation is called a <em>deck</em>. Get
        going by clicking
                <x-button onclick={newDeck}>
                    <x-label>New Deck</x-label>
                </x-button>.
        From here you must choose a
        location and name for your new deck.</p>

        <p>Whiteboard is only controlled by the application
        menu, and additionally the context menu (<em>Right
        click</em> or <em>&#8984; + Click</em>).</p>

        <p>Using the menu, or <code>F2</code>, you can create, edit, delete,
        and re-arrange slides. Create a slide for each activity you want to
        demo, and add an editor, terminal, markdown text, or browser as
        appropriate for each slide. When you are done, be sure to save from the
        <code>File</code> menu.</p>

        <h1>The Whiteboard file format</h1>
        <p>The decks are stored in a plaintext format that
        resembles INI files, with the extension `.whiteboard`.
        The format is simple and convenient enough to edit by
        hand. Example file:</p>

<pre>
[slide]
title=POST request demonstration
terminal=./POST_python/
editor=./POST_python/*.py

[slide]
title=Demo of final app
browser = ./POST_challenge/index.html
markdown : '''
# Recreate the browser
- Try to recreate this app using Flask
- Hint: You'll have to use a POST endpoint
'''
</pre>
    </div>


    <script>
        'use strict';

        newDeck() {
            opts.send('menu_new');
        }
    </script>
</wb-help>
