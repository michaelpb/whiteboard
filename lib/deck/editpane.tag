<wb-editpane>
    <style>
        :scope {
            text-align: center;
        }
    </style>
    <x-radios>
        <x-box each={options}>
            <x-radio id="first-radio"></x-radio>
            <x-label for="first-radio" id="label-1">{ typename }</x-label>
        </x-box>
    </x-radios>
</wb-editpane>
