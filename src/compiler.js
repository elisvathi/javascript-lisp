const parse = require("./parser");
const fs = require("fs");
const baseCode = `
cosnt quote = a => a;
const atom = a => !(a instanceof Array) || a.length === 0;
const eq = (a, b) => (a instanceof Array && b instanceof Array) ? a.length === 0 && b.length === 0 : a === b;
const car = a => a[0] || [];
const cdr = a => a.length ? a.slice(1) : [];
const cons = (a, b) => [a, ...b];
const cond = (...a) => { for (const item in a){if(item[0]) { return item[i]; } } return [];};
const list = (...args) => args;
`;
const primitive_functions = {
    defun: (rest) => {
        const [defun_name, defun_params, defun_exp] = rest;
        return `${defun_name}=>${defun_params.join('=>')}=>${eval_code(defun_exp) }\n`;
    },
    let: (rest) => {
        let str = `{\n`;
        const defs = rest.slice(0, rest.length - 1);
        const exp = rest[rest.length - 1];
        str += defs.map(x => `\tlet ${x[0]} = ${eval_code(x[1])};`).join('\n');
        str += "\n\treturn" + eval_code(exp);
        str += `\n}`;
        return str;
    },
    defvar: (rest) => {
        const dvName = rest[0];
        const dvValue = eval_code(rest[1]);
        return `let ${dvName} = ${dvValue};\n`;
    },
    "n-global": (rest) => {
        return `(global||window)[${eval_code(rest[0])}]`;
    },
    "n-require": (rest) => {
        return `require(${eval_code(rest[0])});\n`;
    },
    "n-callback": (rest) => {
        return (...args) => {
            let [params, exp] = rest;
            if (!(params instanceof Array)) {
                params = [params];
            }
            return `(${params.join(', ')})=>${ eval_code(exp) }`;
        };
    },
    "n-global-set": (rest) => {
        const g = global || window;
        const [f, v] = rest;
        return `(global||window)[${eval_code(f)}] = ${eval_code(v)}`;
    },
    "n-get": (rest) => {
        const [f, s] = rest;
        return `${eval_code(f)}[${eval_code(s)}]`;
    },
    "n-set": (rest) => {
        const [o, f, v] = rest;
        return `${eval_code(o)}[${eval_code(f)}] = ${eval_code(v)}`;
    },
    "n-call": (rest) => {
        return `${eval_code(rest[0])}(${rest.slice(1).map(eval_code).join(', ')})`;
    },
    "n-construct": (rest) => {
        return `new ${eval_code(rest[0])}(${rest.slice(1).map(eval_code)})`;
    }
};

const primitive_operators = {
    "+": (a, b) => `${a} + ${b}`,
    "-": (a, b) => `${a} - ${b}`,
    "*": (a, b) => `${a} * ${b}`,
    "/": (a, b) => `${a} / ${b}`,
    ">": (a, b) => `${a} > ${b}`,
    "<": (a, b) => `${a} < ${b}`,
    ">=": (a, b) =>`${a} >= ${b}`,
    "<=": (a, b) =>`${a} <= ${b}`,
};

function handleOperator(op, rest) {
    const [first, second] = rest;
    const [ef, es] = [eval_code(first), eval_code(second)];
    return op(ef, es);
}

function eval_code(t) {
    if (t instanceof Array) {
        if (t.length > 0) {
            const [first, ...rest] = t;
            if (first in primitive_functions) {
                return primitive_functions[first](rest);
            }
            const def = findDefinition(first);
            if (def) {
                return eval_code([def, ...rest]);
            }
            const variable = findVariable(first);
            if (variable) {
                return variable;
            }
            if (first in primitive_operators) {
                return handleOperator(primitive_operators[first], rest);
            }
            if (first instanceof Array) {
                if (first[0].toString().toLowerCase() === "lambda") {
                    // return `(${})=>{}`;
                    // const args = rest.map((x) => eval_code(x));
                    // let [_, params, exp] = first;
                    // if (!(params instanceof Array)) {
                    //     params = [params];
                    // }
                    // const argMap = args.reduce((accum, item, index) => {
                    //     accum[params[index]] = item;
                    //     return accum;
                    // }, {});
                    // const new_exp = replaceInExp(exp, argMap);
                    // return eval_code(new_exp);
                }
            }
            return t;
        }
        return t;
    } else {
        const str_match = '"([^"]|\\")+"';
        if ((typeof t === 'string') && t.match(str_match)) {
            return t.substr(1, t.length - 2);
        }
        return findDefinition(t) || findVariable(t) || t;
    }
}

function replaceInExp(exp, args) {
    if (exp instanceof Array) {
        return exp.map((x) => replaceInExp(x, args));
    } else {
        return args[exp] || exp;
    }
}


function printItem(item) {
    if (item === true) {
        return "t";
    }
    if (item instanceof Array) {
        return `(${item.map(printItem).join(" ")})`;
    }
    return item;
}

function mapBool(a) {
    return a === true ? a : [];
}

function findDefinition(name, scope) {
    for (let i = scope.length - 1; i >= 0; i--) {
        if (scope[i].definitions[name]) {
            return scope[i].definitions[name];
        }
    }
    return null;
}

function findVariable(name, scope) {
    for (let i = scope.length - 1; i >= 0; i--) {
        if (scope[i].variables[name]) {
            return scope[i].variables[name];
        }
    }
    return null;
}

module.exports = {
    eval_code,
    printItem
};
