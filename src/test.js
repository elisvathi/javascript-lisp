const parse = require('./parser');
const {
    eval_code,
    printItem
} = require('./interpreter');
const fs = require('fs');
const code = fs.readFileSync("examples/test.lisp").toString();
const parsed = parse(code);
const initialScope = {definitions: {}, variables: {}};
const result = parsed.map(x=>eval_code(x, [ initialScope ])).filter(x => x !== null);
result.filter(x => x !== null && x !== undefined).forEach(x => console.log(printItem(x)));
