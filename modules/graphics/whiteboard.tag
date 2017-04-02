<whiteboard>
    <style scoped>
        #drawing {
            height: 500px;
            width: 500px;
        }
    </style>

    <div id="drawing">
    </div>

    <script>
        'use strict';
        this.on('mount', () => {
            const myBoard = new DrawingBoard.Board('drawing');
        });
    </script>
</whiteboard>
