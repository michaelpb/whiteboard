<!-- Utility -->
<raw>
    <script>
        this.root.innerHTML = this.opts.html;
    </script>
</raw>

<raw-style>
    <script>
        'use strict';
        refresh(css) {
            if (!window._style_node) {
                window._style_node = document.createElement('style');
                document.body.appendChild(window._style_node);
            }
            window._style_node.innerHTML = css;
        }

        this.on('updated', () => {
            this.refresh(this.opts.css);
        });

        this.on('mount', () => {
            this.refresh(this.opts.css);
        });

        this.on('unmount', () => {
            this.refresh('');
        });
    </script>
</raw-style>

<!--
// TODO: fix the errors around this (try #2)
<raw-style>
    <script>
        'use strict';
        let sheet;

        remove() {
            if (sheet) {
                document.body.removeChild(sheet);
            }
        }

        refresh(css) {
            this.remove();
            sheet = document.createElement('style');
            // For some reason, this is causing syntax errors that choke out
            // execution:
            sheet.innerHTML = css;
            document.body.appendChild(sheet);
        }


        this.on('update', () => {
            this.remove();
        });

        this.on('updated', () => {
            this.refresh(this.opts.css);
        });

        this.on('mount', () => {
            this.refresh(this.opts.css);
        });

        this.on('unmount', () => {
            this.remove();
        });
    </script>
</raw-style>
-->
<!--
<raw-style>
    <span></span>
    <script>
        'use strict';
        let sheet;
        remove() {
        }

        refresh(css) {
            // Very brittle method of adding CSS:
            const sheet = window.document.styleSheets[0];
            const split = css.split(/}/g);
            for (let item of split) {
                if (item.match(/^\s*$/)) {
                    continue; // empty
                }

                if (!item.match(/\}\s*$/)) {
                    item = item + '}';
                }
                // window.log('this is item', item);
                sheet.insertRule(item, sheet.cssRules.length);
            }
        }

        this.on('update', () => {
            this.remove();
        });

        this.on('updated', () => {
            this.refresh(this.opts.css);
        });

        this.on('mount', () => {
            this.refresh(this.opts.css);
        });

        this.on('unmount', () => {
            this.remove();
        });
    </script>
</raw-style>
-->

<!-- Materialize -->
<collection>
    <ul class="collection">
        <yield />
    </ul>
</collection>

<collection-item>
    <li class="collection-item brown 
    {active ? 'darken-4' : 'lighten-4'}
    {active ? 'white-text' : 'black-text'}
    " onClick={onClick}>
        <yield />
    </li>
</collection-item>

<text-size-select>
    <rg-pagination></rg-pagination>
</text-size-select>

<mat-input-field>
    <div class="input-field col s6">
        <input value={opts.value} name={opts.name} id={opts.name} type="text" class="validate" />
        <label class='active' for={opts.name}><yield />{opts.label}</label>
    </div>
</mat-input-field>

<bubble-beam>
    <div class="fixed-action-btn hide-without-mouse" style="left: 10px; bottom: 10px">
        <a class="btn-floating btn-large brown lighten-1" onclick="opts.onclick">
            <i class="large mdi-action-receipt"></i>
        </a>
        <ul>
            <!--
            <li><a class="btn-floating {% cycle red yellow green blue orange purple cyan %} {% cycle darken-1 darken-2 %}"
                    data-tooltip="{{ button_info.tooltip }}"
                    data-bubblebeamclick="{{ button_info.name }}">
                <i class="large {{ button_info.icon_class }}"></i></a>
            </li>
            -->
        </ul>
    </div>
</bubble-beam>
