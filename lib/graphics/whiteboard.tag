<whiteboard>
    <style scoped>
        #drawing {
            height: 500px;
            width: 500px;
        }

        .whiteboard-wrapper {
            height: 100%;
        }

        .whiteboard-wrapper .card-content {
            height: 100%;
        }

        .drawing-div {
            height: 100%;
            width: 100%;
        }
    </style>


    <div class="whiteboard-wrapper card brown lighten-5 z-depth-4">
        <div class="card-content">
            <div class="drawing-div" id="drawing" name="drawing_div">
            </div>
        </div>
    </div>

    <script>
        'use strict';
        require('../../node_modules/javascript-detect-element-resize/detect-element-resize');

        this.on('mount', () => {
            // XXX Riot 3 vvvv (switch to refs)
            this.drawing_div = document.querySelector('#drawing');
            this.drawing_div.id = `drawing_div_id_${Math.floor(Math.random()*10000000)}`;
            const myBoard = new DrawingBoard.Board(this.drawing_div.id, {
                controls: [
                    'Color',
                    { Size: { type: 'dropdown' } },
                    { DrawingMode: { filler: false } },
                    'Navigation',
                ],
                background: "#efebe9",
                color: "#263238",
                size: 20,
            });
        });
    </script>
</whiteboard>
