/* eslint-disable no-param-reassign */

const { mockWindowManager } = require('elmoed').testutils;
const Editor = require('../../lib/editor/Editor');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'support', 'data', 'editor');

const MYFILE1 = '<h1>Hell: O-World</h1>\n';


describe('Editor', () => {
    let manager = null;

    beforeEach(() => {
        ({ manager } = mockWindowManager('editor', Editor));
    });


    // Integrat-y unit tests for Editor
    describe('when mounting with various files', () => {
        it('successfully defaults to dummy file when empty', (done) => {
            manager.createWindow('editor', (editor) => {
                expect(editor.tabs.length).toEqual(1);
                done();
            }, '');
        });

        it('is successful with a comma-sep list of files', (done) => {
            manager.createWindow('editor', (editor) => {
                expect(editor.tabs.length).toEqual(2);
                expect(path.basename(editor.tabs[0].path))
                    .toEqual('file1.js');
                expect(path.basename(editor.tabs[1].path))
                    .toEqual('file2.js');
                expect(editor.activeFilePath).toEqual(editor.tabs[0].path);
                done();
            }, 'file1.js, file2.js');
        });

        it('is successful with list of files', (done) => {
            manager.createWindow('editor', (editor) => {
                expect(editor.tabs.length).toEqual(2);
                expect(path.basename(editor.tabs[0].path))
                    .toEqual('file1.js');
                expect(path.basename(editor.tabs[1].path))
                    .toEqual('file2.js');
                done();
            }, 'file1.js\n   file2.js');
        });

        it('successfully relativizes a list of files', (done) => {
            manager.createWindow('editor', (editor) => {
                editor.path = '/some/path/thing.whiteboard!slide-3!editor';
                expect(editor.serialized()).toEqual('file1.js,file2.js');
                done();
            }, '/some/path/file1.js\n   /some/path/file2.js');
        });

        it('is successful with a glob', (done) => {
            manager.createWindow('editor', (editor) => {
                // Loading 4 total files
                expect(editor.tabs.length).toEqual(4);
                done();
            }, [DATA_DIR, '**', '*.*'].join(path.sep));
        });
    });

    describe('loads files correctly', () => {
        const PATH = [DATA_DIR, 'dir1', 'myfile1.html'].join(path.sep);
        const PATH1 = PATH;
        const PATH2 = [DATA_DIR, 'dir2', 'myfile2.txt'].join(path.sep);
        const TWO_TABS = {
            path: PATH1,
            tabs: [
                {
                    title: 'myfile1.html',
                    path: PATH1,
                    active: true,
                },
                {
                    title: 'myfile2.txt',
                    path: PATH2,
                    active: false,
                },
            ],
            text: MYFILE1,
            font_size: 28,
            theme: 'light',
        };
        it('loads a single file', (done) => {
            manager.createWindow('editor', (editor) => {
                // just loads 1 file
                expect(editor.tabs.length).toEqual(1);
                expect(editor.tabs[0].text).toEqual(MYFILE1);
                expect(editor.getActiveFileText()).toEqual(MYFILE1);
                expect(editor.getProps()).toEqual({
                    path: PATH,
                    tabs: [
                        {
                            title: 'myfile1.html',
                            path: PATH,
                            active: true,
                        },
                    ],
                    text: MYFILE1,
                    font_size: 28,
                    theme: 'light',
                });
                done();
            }, PATH);
        });

        it('loads multiple files correctly', (done) => {
            manager.createWindow('editor', (editor) => {
                // just loads 2 file
                expect(editor.tabs.length).toEqual(2);
                expect(editor.tabs[0].text).toEqual(MYFILE1);
                expect(editor.getActiveFileText()).toEqual(MYFILE1);
                expect(editor.getProps()).toEqual({
                    path: PATH1,
                    tabs: [
                        {
                            title: 'myfile1.html',
                            path: PATH1,
                            active: true,
                        },
                        {
                            title: 'myfile2.txt',
                            path: PATH2,
                            active: false,
                        },
                    ],
                    text: MYFILE1,
                    font_size: 28,
                    theme: 'light',
                });
                done();
            }, `${PATH1},${PATH2}`);
        });

        it('switches between files', (done) => {
            manager.createWindow('editor', (editor) => {
                // loads 2 files
                editor.activeFilePath = PATH2;
                expect(editor.getActiveFileText()).toEqual('');
                expect(editor.getProps()).toEqual({
                    path: PATH2,
                    tabs: [
                        {
                            title: 'myfile1.html',
                            path: PATH1,
                            active: false,
                        },
                        {
                            title: 'myfile2.txt',
                            path: PATH2,
                            active: true,
                        },
                    ],
                    text: '',
                    font_size: 28,
                    theme: 'light',
                });
                done();
            }, `${PATH1},${PATH2}`);
        });

        it('closes tabs', (done) => {
            manager.createWindow('editor', (editor) => {
                editor.activeFilePath = PATH2;
                expect(editor.getActiveFileText()).toEqual('');
                editor.closeTab();
                expect(editor.getProps()).toEqual({
                    path: PATH1,
                    tabs: [
                        {
                            title: 'myfile1.html',
                            path: PATH1,
                            active: true,
                        },
                    ],
                    text: MYFILE1,
                    font_size: 28,
                    theme: 'light',
                });
                done();
            }, `${PATH1},${PATH2}`);
        });

        it('closing last tab opens dummy tab', (done) => {
            manager.createWindow('editor', (editor) => {
                expect(editor.tabs.length).toEqual(2);
                // try 3 times to ensure idempotent
                editor.closeTab();
                expect(editor.tabs.length).toEqual(1);
                editor.closeTab();
                expect(editor.tabs.length).toEqual(1);
                editor.closeTab();
                expect(editor.tabs.length).toEqual(1);
                done();
            }, `${PATH1},${PATH2}`);
        });

        it('opens additional file successfully', (done) => {
            manager.createWindow('editor', (editor) => {
                // just loads 2 file
                expect(editor.tabs.length).toEqual(1);
                expect(editor.getActiveFileText()).toEqual(MYFILE1);
                editor.addTabs([PATH2], () => {
                    expect(editor.tabs.length).toEqual(2);
                    expect(editor.getActiveFileText()).toEqual(MYFILE1);
                    expect(editor.getProps()).toEqual(TWO_TABS);
                    done();
                });
            }, PATH1);
        });

        it('dummy tab gets replaced when opening files', (done) => {
            manager.createWindow('editor', (editor) => {
                expect(editor.tabs.length).toEqual(1);
                editor.addTabs([PATH1, PATH2], () => {
                    expect(editor.tabs.length).toEqual(2);
                    expect(editor.getActiveFileText()).toEqual(MYFILE1);
                    expect(editor.getProps()).toEqual(TWO_TABS);
                    done();
                });
            }, '');
        });
    });

    afterEach(() => {
        manager = null;
    });
});

