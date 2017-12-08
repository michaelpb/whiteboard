// This module contains code copied from the TagLex module, which is for
// building small markdown-like languages. In this case, it contains a minimal
// for of markdown presently only use by the Title module

const taglex = require('taglex');

const ruleset = new taglex.TagRuleSet();
const classes = new taglex.TagClassManager();

// Let's start with a simple italic tag, specified _like this_
ruleset.add_tag({
    name: 'italic',
    open: '_', close: '_',

    // contained by 'style' and 'containers'
    parents: classes.get('style', 'container', 'root'),

    // payload can be in any structure we want
    payload: {start: '<em>', finish: '</em>'},
});
classes.add('italic', 'style') // we give it the class 'style'

// Same thing for bold
ruleset.add_tag({
    name: 'bold',
    open: '**', close: '**',
    parents: classes.get('style', 'container', 'root'),
    payload: {start: '<strong>', finish: '</strong>'}
});
classes.add('bold', 'style')


function minimarkdown(input) {
    // Create a new parser for each input
    const parser = ruleset.new_parser();

    const results = [];
    parser.on('tag_open', (payload, token) => {
        results.push(payload.start);
    });

    parser.on('text_node', (text) => {
        // escape html & normalize whitespace
        const normalized = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&lt;')
            .replace(/\r?\n/g, '<br />')
            .replace(/^\s*/, '')
            .replace(/\s*$/, '')
            .replace(/[\s]+/g, ' ');
        results.push(normalized);
    });

    parser.on('tag_close', (payload, token) => {
        results.push(payload.finish + '\n');
    });

    parser.write(input);

    // parser automatically close remaining tags when .end() is called
    parser.end();


    // Return the processed results
    return results.join('');
}

module.exports.minimarkdown = minimarkdown;
