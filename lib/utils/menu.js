
/*
    Given a Menu Template, strip all given fields
*/
function stripMenuTemplate(menuTemplate, ...keysToStrip) {
    const results = [];
    for (const item of menuTemplate) {
        const newItem = Object.assign({}, item);
        results.push(newItem);
        if (item.submenu) {
            newItem.submenu = stripMenuTemplate(item.submenu, ...keysToStrip);
            continue;
        }
        for (const key of keysToStrip) {
            if (key in newItem) {
                delete newItem[key];
            }
        }
    }
    return results;
}

/*
    Given a Menu Template, flatten only including certain keys
*/
function flattenMenuTemplate(menuTemplate, ...keysToInclude) {
    const results = [];
    for (const item of menuTemplate) {
        if (item.submenu) {
            results.push(...flattenMenuTemplate(item.submenu, ...keysToInclude));
            continue;
        }

        const newItem = {};
        for (const key of keysToInclude) {
            newItem[key] = item[key];
        }
        results.push(newItem);
    }
    return results;
}

module.exports = {
    stripMenuTemplate,
    flattenMenuTemplate,
};
