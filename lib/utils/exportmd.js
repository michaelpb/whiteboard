const fs = require('fs');
const schemaconf = require('schemaconf');

// Used by many Markdown-based slide applications to separate out slides
const SLIDE_SEPARATORS = '\n\n---\n\n';


function doMarkdownExport(argv) {
    const filename = argv[argv.length - 1];
    // otherwise read data from file
    const contents = fs.readFileSync(filename, 'utf8');
    const data = schemaconf.format.parse(contents);
    const markdownResults = deckDataToMarkdown(data);
    console.log(markdownResults);
}

function demoteMarkdownHeaders(text) {
    // Demotes all markdown headers by 1 level
    const demoted = text.replace(/^#/g, '##');
    // Fixes any ####### (header 7 level, too tiny)
    return demoted.replace(/^#######/g, '######');
}

function deckDataToMarkdown(data) {
    const slides = data.slide;
    const slideResults = [];
    for (const slide of slides) {
        let slideMd = '';
        const { title, editor, terminal, markdown, browser } = slide;
        if (title) {
            slideMd += `# ${title}\n\n`;
        }

        if (markdown) {
            // Markdown is the main goal here, gets put in just with the header
            // level demoted so it isn't at the same level as the slide title
            const cleanedMd = demoteMarkdownHeaders(markdown);
            slideMd += `\n\n${cleanedMd}\n\n`;
        }

        if (editor) {
            // File editor filenames just gets code block fenced
            slideMd += '##### Demo: Files\n\n';
            slideMd += '```\n' + editor.replace(',', '\n') + '\n```\n\n';
        }

        if (terminal) {
            // Terminal just gets the directory
            slideMd += '##### Demo: Terminal\n\n';
            slideMd += 'Terminal: `' + terminal + '`\n\n';
        }

        if (browser) {
            // Turn browser into a link
            slideMd += '##### Demo: Browser\n\n';
            slideMd += `Link: [${browser}](${browser})`;
        }

        // Trim any excess whitespace
        slideMd = slideMd.trim();

        slideResults.push(slideMd);
    }

    // join all slides with the slide separator
    return slideResults.join(SLIDE_SEPARATORS);
}

module.exports = {
    doMarkdownExport,
    deckDataToMarkdown,
};
