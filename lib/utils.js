const walkSync = require('walk-sync');
const pathlib = require('path');
const fs = require('fs');

// From ACE editor's modelist supportedModes
const ace_supported_modes = {
    ABAP: ['abap'],
    ABC: ['abc'],
    ActionScript: ['as'],
    ADA: ['ada|adb'],
    Apache_Conf: ['^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd'],
    AsciiDoc: ['asciidoc|adoc'],
    Assembly_x86: ['asm|a'],
    AutoHotKey: ['ahk'],
    BatchFile: ['bat|cmd'],
    Bro: ['bro'],
    C_Cpp: ['cpp|c|cc|cxx|h|hh|hpp|ino'],
    C9Search: ['c9search_results'],
    Cirru: ['cirru|cr'],
    Clojure: ['clj|cljs'],
    Cobol: ['CBL|COB'],
    coffee: ['coffee|cf|cson|^Cakefile'],
    ColdFusion: ['cfm'],
    CSharp: ['cs'],
    CSS: ['css'],
    Curly: ['curly'],
    D: ['d|di'],
    Dart: ['dart'],
    Diff: ['diff|patch'],
    Dockerfile: ['^Dockerfile'],
    Dot: ['dot'],
    Drools: ['drl'],
    Dummy: ['dummy'],
    DummySyntax: ['dummy'],
    Eiffel: ['e|ge'],
    EJS: ['ejs'],
    Elixir: ['ex|exs'],
    Elm: ['elm'],
    Erlang: ['erl|hrl'],
    Forth: ['frt|fs|ldr|fth|4th'],
    Fortran: ['f|f90'],
    FTL: ['ftl'],
    Gcode: ['gcode'],
    Gherkin: ['feature'],
    Gitignore: ['^.gitignore'],
    Glsl: ['glsl|frag|vert'],
    Gobstones: ['gbs'],
    golang: ['go'],
    Groovy: ['groovy'],
    HAML: ['haml'],
    Handlebars: ['hbs|handlebars|tpl|mustache'],
    Haskell: ['hs'],
    Haskell_Cabal: ['cabal'],
    haXe: ['hx'],
    Hjson: ['hjson'],
    HTML: ['html|htm|xhtml'],
    HTML_Elixir: ['eex|html.eex'],
    HTML_Ruby: ['erb|rhtml|html.erb'],
    INI: ['ini|conf|cfg|prefs'],
    Io: ['io'],
    Jack: ['jack'],
    Jade: ['jade|pug'],
    Java: ['java'],
    JavaScript: ['js|jsm|jsx'],
    JSON: ['json'],
    JSONiq: ['jq'],
    JSP: ['jsp'],
    JSX: ['jsx'],
    Julia: ['jl'],
    Kotlin: ['kt|kts'],
    LaTeX: ['tex|latex|ltx|bib'],
    LESS: ['less'],
    Liquid: ['liquid'],
    Lisp: ['lisp'],
    LiveScript: ['ls'],
    LogiQL: ['logic|lql'],
    LSL: ['lsl'],
    Lua: ['lua'],
    LuaPage: ['lp'],
    Lucene: ['lucene'],
    Makefile: ['^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make'],
    Markdown: ['md|markdown'],
    Mask: ['mask'],
    MATLAB: ['matlab'],
    Maze: ['mz'],
    MEL: ['mel'],
    MUSHCode: ['mc|mush'],
    MySQL: ['mysql'],
    Nix: ['nix'],
    NSIS: ['nsi|nsh'],
    ObjectiveC: ['m|mm'],
    OCaml: ['ml|mli'],
    Pascal: ['pas|p'],
    Perl: ['pl|pm'],
    pgSQL: ['pgsql'],
    PHP: ['php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module'],
    Powershell: ['ps1'],
    Praat: ['praat|praatscript|psc|proc'],
    Prolog: ['plg|prolog'],
    Properties: ['properties'],
    Protobuf: ['proto'],
    Python: ['py'],
    R: ['r'],
    Razor: ['cshtml|asp'],
    RDoc: ['Rd'],
    RHTML: ['Rhtml'],
    RST: ['rst'],
    Ruby: ['rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile'],
    Rust: ['rs'],
    SASS: ['sass'],
    SCAD: ['scad'],
    Scala: ['scala'],
    Scheme: ['scm|sm|rkt|oak|scheme'],
    SCSS: ['scss'],
    SH: ['sh|bash|^.bashrc'],
    SJS: ['sjs'],
    Smarty: ['smarty|tpl'],
    snippets: ['snippets'],
    Soy_Template: ['soy'],
    Space: ['space'],
    SQL: ['sql'],
    SQLServer: ['sqlserver'],
    Stylus: ['styl|stylus'],
    SVG: ['svg'],
    Swift: ['swift'],
    Tcl: ['tcl'],
    Tex: ['tex'],
    Text: ['txt'],
    Textile: ['textile'],
    Toml: ['toml'],
    TSX: ['tsx'],
    Twig: ['twig|swig'],
    Typescript: ['ts|typescript|str'],
    Vala: ['vala'],
    VBScript: ['vbs|vb'],
    Velocity: ['vm'],
    Verilog: ['v|vh|sv|svh'],
    VHDL: ['vhd|vhdl'],
    Wollok: ['wlk|wpgm|wtest'],
    XML: ['xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml'],
    XQuery: ['xq'],
    YAML: ['yaml|yml'],
    Django: ['html'],
};

// Flattened version of all extensions
const known_code_file_extensions = [].concat(
    ...Object.keys(ace_supported_modes)
        .map(key => ace_supported_modes[key][0].toLowerCase().split('|')));

function path_to_title(file_path) {
    return file_path
        // Split by path sep and iterate over items
        .split(pathlib.sep).map(item => item
            // Clean up leading non-alpha characters
            .replace(/^[^a-z]*/i, '')

            // replace non word characters
            .replace(/[\W_]+/g, ' ')

            // replace excess grouped space characters
            .replace(/\s+/g, ' ').trim()

            // Replace camel case with spaces
            .replace(/([a-z](?=[A-Z]))/g, '$1 ')
        )
        .join(' - ');
}

function is_code_file(filepath) {
    let ext = pathlib.extname(filepath).toLowerCase().replace(/^\./, '');
    if (ext === '') {
        ext = `^${pathlib.basename(filepath).toLowerCase()}`;
    }
    return known_code_file_extensions.includes(ext);
}

const ignorable_dirs = [
    'node_modules', // ignore node_modules
    '__pycache__', // things like
    'build', // skip over built directories
    '_build', // built docs
];

function is_relevant_path(filepath) {
    // Check if filepath isn't hidden or ignored
    for (const part of filepath.split(pathlib.sep)) {
        if (part.startsWith('.') || ignorable_dirs.includes(part)) {
            return false;
        }
    }
    return true;
}

function autogenerate_deck_from_dir(root_path) {
    const paths = walkSync(root_path).filter(is_relevant_path);
    if (paths.length > 150) {
        throw new Error('Too much stuff to import, try smaller bites');
    }

    paths.sort();
    const directories = paths.filter(path => path.endsWith('/'));
    const grouped = {};
    const files = paths.filter(path => !path.endsWith('/'));
    const code_files = files.filter(is_code_file);
    for (const file of code_files) {
        const dir = pathlib.dirname(file);
        if (dir === '.' && !directories.includes(dir)) {
            directories.unshift(dir);
        }
        if (!(dir in grouped)) {
            grouped[dir] = [];
        }
        grouped[dir].push(file);
    }

    const slides = [];
    for (let dir of directories) {
        if (dir.endsWith('/')) {
            // strip trailing slashes
            dir = dir.replace(/\/$/, '');
        }

        if (!(dir in grouped)) {
            continue; // empty directory, don't include in slides
        }

        const slide = {};
        slide.editor = '';
        slide.title = path_to_title(dir);
        slide.terminal = pathlib.resolve(root_path, dir);

        if (dir === '.') {
            // First slide, adjust title
            slide.title = path_to_title(pathlib.basename(root_path));
        }

        for (const file of grouped[dir]) {
            const fp = pathlib.resolve(root_path, file);
            if (pathlib.extname(file) === '.html') {
                // HTML file, add browser
                slide.browser = `file://${fp}`;
                delete slide.terminal; // no need for terminal if has HTML
            }

            if (pathlib.extname(file) === '.md') {
                // markdown files get included on the slide
                slide.markdown = fs.readFileSync(fp);
            } else {
                // while everything else gets added to editor
                slide.editor += `\n${fp}`;
            }
        }

        // no code files? remove editor
        if (slide.editor === '') {
            delete slide.editor;
        }
        slides.push(slide);
    }
    return slides;
}

module.exports = {
    autogenerate_deck_from_dir,
    path_to_title,
    known_code_file_extensions,
    is_code_file,
};
