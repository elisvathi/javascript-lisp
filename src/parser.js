/**
 * Tokenize source code
 * @param {String} inputText
 * @returns {Array<{key: String, text: String}>}
 */
function lex(inputText) {
    if (inputText.length === 0) {
        return [];
    };
    const regexps = {
        comment: ";;.+",
        empty: "\\s+",
        id: "[_\\-a-zA-Z\\.\\+\\-\\*\\/<>=]+",
        float: "[0-9]+\\.[0-9]+",
        integer: "[0-9]+",
        string: '"([^"]|\\")+"',
        "(": "\\(\\s*",
        ")": "\\s*\\)",
        quote: "'",
        eof: "Z",
    };
    const match = Object.keys(regexps)
        .map((key) => {
            return {
                key,
                matches: inputText.match(regexps[key])
            };
        })
        .filter(x => x.matches)
        .filter(x => x.matches.index === 0)
        .map(x => ({
            key: x.key,
            text: x.matches[0]
        }))
        .reduce((accum, item) => {
            if (!accum) {
                return item;
            }
            return item.text.length > accum.text.length ? item : accum;
        }, null);
    if (!match) {
        throw new Error(`Syntax error near: \n\t\t\t${inputText.substr(0, 100)}`);
    }
    return [match, ...lex(inputText.substr(match.text.length))]
        .filter(x => !["comment", "empty"].includes(x.key));
}

function parse_list(tokenStream) {
    const mainStack = {
        parent: null,
        list: []
    };
    let stack = mainStack;
    while (tokenStream.length > 0) {
        const token = tokenStream.shift();
        if (token.key === '(') {
            const oldStack = stack;
            stack = {
                parent: oldStack,
                list: []
            };
            oldStack.list.push(stack);
        } else if (token.key === ")") {
            stack = stack.parent;
            if (stack === null && tokenStream.length > 0) {
                throw new Error("Unbalanced parantheses!");
            }
        } else {
            if (token.key === "quote") {
                token.text = "quote";
            }
            stack.list.push(token);
        }
    }
    if (stack !== mainStack) {
        throw new Error("Unbalanced parantheses!");
    }
    return fixQuotes(stackToList(mainStack));
}

function stackToList(stack) {
    if (stack instanceof Object && 'list' in stack) {
        return stack.list.map(stackToList);
    }
    return stack.text;
}

function fixQuotes(stack) {
    if (stack instanceof Array) {
        return stack.reduce((accum, item, index, array) => {
            if (item === 'quote') {
                return accum;
            }
            if (index > 0 && array[index - 1] === 'quote') {
                accum.push(["quote", fixQuotes(item)]);
            } else {
                accum.push(fixQuotes(item));
            }
            return accum;
        }, []);
    }
    return stack;
}

function parse(text) {
    return parse_list(lex(text));
}

module.exports = parse;
