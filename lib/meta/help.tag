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
            background: white;
            color: black !important;
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

        <h1 class="title">Getting started</h1>

        <h2>Two ways of creating decks</h2>

        <p>Each presentation is called a <em>deck</em>. You have two
        routes for creating decks:</p>
        <ol>
            <li>GUI: You can create new decks entirely with the GUI, by
            clicking on
                <x-button onclick={newDeck} skin="textured">
                    <x-label>New Deck</x-label>
                </x-button>.
            After you choose a location and filename to save, you
            are good to go with your first slide-show.</li>

            <li>Text: by editing the <code>.whiteboard</code> plain-text
            file-format. If you are more at home in a text editor, this
            might be the fastest. <a href="#fileformat">Click here to learn
            how to do this.</a></li>
        </ol>

        <hr />
        <h2>Using Whiteboard</h2>

        <p><strong>Menus:</strong> Whiteboard is entirely controlled by the application menu and the
        context menu (using <em>Right click</em> or <em>Ctrl + Click</em>). The
        context menu is different depending on where you click, so if you
        right-click on the Editor, for example, you will have options to save
        the current file open in the editor.</p>

        <p><strong>Shortcuts:</strong> Most menu actions have also a shortcut
        key assigned. Like the context menu, the available shortcuts change
        dependign on which pane you are using. For example: for the editor
        <code>Ctrl+S</code> will save the open file, and for the browser,
        <code>Ctrl+R</code> will hard-refresh. To see the list of all available
        shortcuts, hit F1.</p>

        <p><strong>Slide editing:</strong> Using the menu, or <code>F2</code>,
        you can create, edit, delete, and re-arrange slides. Create a slide for
        each activity you want to demo, and add an editor, terminal, markdown
        text, or browser as appropriate for each slide. When you are done, be
        sure to save from the <code>File</code> menu.</p>

        <p id="fileformat"></p>
        <hr />
        <h2>The Whiteboard file format</h2>
        <p>The decks are stored in a plaintext format that
        resembles INI files, with the extension `.whiteboard`.  The format is
        simple and convenient enough to edit by hand.


        <div class="columns">
            <div class="column">
                <h2>Accepted values in slides</h2>
                <ul>
                    <li><strong>title</strong> - a bold title at the top of the
                    slide</li>

                    <li><strong>browser</strong> - consists of a web-browser
                    that can be pointed to a remote HTTP address (starting with
                    <code>http://</code> or <code>https://</code>) or local
                    HTML file (starting with <code>file://</code>).</li>

                    <li><strong>editor</strong> - can edit multiple code files
                    in tabs with syntax highlighting, consisting of comma (or
                    new-line) separated of relative or absolute file paths.
                    Wild cards / glob syntax is accepted.</li>

                    <li><strong>terminal</strong> - bash terminal, specify a
                    starting directory</li>

                    <li><strong>markdown</strong> - multi-line element to
                    contain arbitrary explanatory text</li>

                    <li><em>maximize</em> - the value should be one of the
                    above pane types, causing that pane be maximized at the
                    start (useful while introducing a topic to avoid having
                    unrelated or distracting text until the time comes)</li>

                    <li><em>layout</em> - layout of the slide, the value should
                    be one "horizontal", "vertical", or "grid"</li>
                </ul>
            </div>
            <div class="column">
                <h2>Syntax</h2>
                <p>
                The Whiteboard format consists of lines of <code>[slide]</code>
                followed by key/value pairs in the format of <code>key = value</code>,
                each on a new line. For multi-line values, you can use the syntax
                <code>key : ''' (... multiple lines of text ...) '''</code>. The only
                requirement is that the final <code>'''</code> is alone on its own
                line.
                </p>
                <h2>Example</h2>


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
