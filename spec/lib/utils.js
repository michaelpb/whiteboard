'use strict';
const {strip} = require('elmoed').testutils;
const path = require('path');
const DATA_DIR = path.resolve(__dirname, '..', 'support', 'data', 'input-dir');

const {
        autogenerate_deck_from_dir,
        path_to_title,
        known_code_file_extensions,
        is_code_file,
    } = require('../../lib/utils');

describe('utils module', () => {
    describe('has a path_to_title function that', () => {
        it('exists', () => {
            expect(path_to_title).toBeTruthy();
        });

        it('converts simple paths to a title', () => {
            expect(path_to_title('this/is/some/path'))
                .toEqual('this - is - some - path');
            expect(path_to_title('05-Demo/Start'))
                .toEqual('Demo - Start');
        });

        it('splits camel case', () => {
            expect(path_to_title('5-DemoStart'))
                .toEqual('Demo Start');
            expect(path_to_title('5-DemoStart/Another_CamelCase____Thing'))
                .toEqual('Demo Start - Another Camel Case Thing');
        });
    });

    describe('has a list of known code files that', () => {
        it('exists', () => {
            expect(known_code_file_extensions).toBeTruthy();
            expect(known_code_file_extensions.length > 10).toBeTruthy();
        });

        it('contains some well known ones', () => {
            expect(known_code_file_extensions.includes('js')).toBeTruthy();
            expect(known_code_file_extensions.includes('html')).toBeTruthy();
            expect(known_code_file_extensions.includes('py')).toBeTruthy();
            expect(known_code_file_extensions.includes('^dockerfile')).toBeTruthy();
        });
    });

    describe('has a function for guessing if a file is a code file that', () => {
        it('exists', () => {
            expect(is_code_file).toBeTruthy();
        });

        it('checks a few common file types', () => {
            expect(is_code_file('my/file/path.md')).toBeTruthy();
            expect(is_code_file('my/file/path.JS')).toBeTruthy();
        });

        it('checks extensionless files', () => {
            expect(is_code_file('asdfaasd')).not.toBeTruthy();
            expect(is_code_file('Dockerfile')).toBeTruthy();
            expect(is_code_file('some/path/to/makefile')).toBeTruthy();
        });
    });

    describe('has a function for generating decks from a dir that', () => {
        it('exists', () => {
            expect(autogenerate_deck_from_dir).toBeTruthy();
        });

        it('generates an expected deck from a simple input dir', () => {
            const deckList = autogenerate_deck_from_dir(DATA_DIR + '/simple/');
            expect(deckList.length).toEqual(1);
            const slide = deckList[0];
            expect(slide.editor).toContain('02-AnotherExample.html');
            expect(slide.editor).toContain('test.html');
            expect(slide.browser).toBeTruthy();
            expect(slide.browser).toContain('.html');
            expect(slide.browser).toContain('file:///');
            expect(slide.terminal).not.toBeTruthy();
            expect(slide.title).toEqual('simple');
        });

        it('generates an expected deck from a complex input dir', () => {
            const deckList = autogenerate_deck_from_dir(DATA_DIR + '/complex/');
            expect(deckList.length).toEqual(5);
            let slide = deckList[0];
            expect(slide.title).toEqual('First');
            expect(slide.editor).toContain('outer.js');
            expect(slide.browser).not.toBeTruthy();
            expect(slide.terminal).toContain('01-First');
            slide = deckList[1];
            expect(slide.title).toEqual('Second Thing');
            expect(slide.editor).toContain('outer-second.js');
            expect(slide.browser).not.toBeTruthy();
            expect(slide.terminal).toContain('02-SecondThing');
            slide = deckList[2];
            expect(slide.title).toEqual('Third thing');
            expect(slide.editor).toContain('outer.js');
            expect(slide.browser).not.toBeTruthy();
            expect(slide.terminal).toContain('03-Third_thing');
            slide = deckList[3];
            expect(slide.title).toEqual('Third thing - Demo');
            expect(slide.editor).toContain('test-solved.html');
            expect(slide.browser).toBeTruthy();
            slide = deckList[4];
            expect(slide.title).toEqual('Third thing - Example');
            expect(slide.editor).toContain('test-unsolved.html');
            expect(slide.browser).toBeTruthy();
        });
    });
});
