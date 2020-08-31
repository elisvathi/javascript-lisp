const parse = require("./parser");
const fs = require("fs");

const primitive_functions = {
    quote: (rest) => {
        const [quote_elem] = rest;
        if (quote_elem === "t") {
            return true;
        }
        return quote_elem;
    },
    atom: (rest, scope) => {
        const atom_elem = eval_code(rest[0], scope);
        if (atom_elem instanceof Array) {
            return atom_elem.length > 0 ? [] : true;
        } else {
            return true;
        }
    },
    eq: (rest, scope) => {
        const [eq_first, eq_second] = [eval_code(rest[0], scope), eval_code(rest[1], scope)];
        if (eq_first instanceof Array && eq_second instanceof Array) {
            const result = eq_first.length === eq_second.length && eq_first.length === 0;
            return result === true ? result : [];
        }
        const res = eq_first === eq_second;
        return res === true ? res : [];
    },
    car: (rest, scope) => {
        const car_first = eval_code(rest[0], scope);
        return car_first[0];
    },
    cdr: (rest, scope) => {
        const cdr_first = eval_code(rest[0], scope);
        if (!cdr_first) {
            return [];
        }
        return cdr_first.slice(1) || [];
    },
    cons: (rest, scope) => {
        const [cons_first, cons_second] = [eval_code(rest[0], scope), eval_code(rest[1], scope)];
        return [cons_first, ...cons_second];
    },
    cond: (rest, scope) => {
        for (const cnd of rest) {
            const isValid = eval_code(cnd[0], scope) === true;
            if (isValid) {
                return eval_code(cnd[1], scope);
            }
        }
        return [];
    },
    defun: (rest, scope) => {
        const [defun_name, defun_params, defun_exp] = rest;
        const defun_lambda = ["lambda", defun_params, defun_exp];
        saveDefinition(defun_name, defun_lambda, scope);
        return null;
    },
    let: (rest, scope) => {
        scope.push({
            definitions: {},
            variables: {}
        });
        const [defs, exp] = rest;
        for (const def of defs) {
            const [name, defExp] = def;
            eval_code(["defvar", name, eval_code(defExp, scope)], scope);
        }
        const value = eval_code(exp, scope);
        scope.pop();
        return value;
    },
    list: (rest, scope) => {
        let ref = [];
        for (let i = rest.length - 1; i >= 0; i--) {
            ref = ["cons", rest[i], ref];
        }
        return eval_code(ref, scope);
    },
    quit: () => {
        process.exit(0);
    },
    clear: () => {
        console.clear();
    },
    defvar: (rest, scope) => {
        const dvName = rest[0];
        const dvValue = eval_code(rest[1], scope);
        saveVariable(dvName, dvValue, scope);
        return null;
    },
    require: (rest, scope) => {
        const filename = eval_code(rest[0], scope);
        if (!required_files[filename]) {
            const file = fs.readFileSync(filename).toString();
            const parsed = parse(file);
            const result = parsed.map(x => eval_code(x, scope));
            result.filter(x => x !== null && x !== undefined).forEach(x => console.log(printItem(x)));
            required_files[filename] = true;
        }
    },
    reload: (rest, scope) => {
        const filename = eval_code(rest[0], scope);
        const file = fs.readFileSync(filename).toString();
        const parsed = parse(file);
        const result = parsed.map(x => eval_code(x, scope));
        result.filter(x => x !== null && x !== undefined).forEach(x => console.log(printItem(x)));
        required_files[filename] = true;
    },
    "n-global": (rest, scope) => {
        const g = global || window;
        return g[eval_code(rest[0], scope)];
    },
    "n-require": (rest, scope) => {
        return require(eval_code(rest[0], scope));
    },
    "n-callback": (rest, scope) => {
        return (...args) => {
            let [params, exp] = rest;
            if (!(params instanceof Array)) {
                params = [params];
            }
            const argMap = args.reduce((accum, item, index) => {
                accum[params[index]] = item;
                return accum;
            }, {});
            const new_exp = replaceInExp(exp, argMap);
            return eval_code(new_exp, scope);
        };
    },
    "n-global-set": (rest, scope) => {
        const g = global || window;
        const [f, v] = rest;
        const [field, value] = [eval_code(f, scope), eval_code(v, scope)];
        g[field] = value;
        return null;
    },
    "n-get": (rest, scope) => {
        const [f, s] = rest;
        const [obj, prop] = [eval_code(f, scope), eval_code(s, scope)];
        const val = obj[prop];
        if (val && (val instanceof Function)) {
            return val.bind(obj);
        }
        return val;
    },
    "n-set": (rest, scope) => {
        const [o, f, v] = rest;
        const [obj, field, value] = [eval_code(o, scope), eval_code(f, scope), eval_code(v, scope)];
        obj[field] = value;
        return null;
    },
    "n-call": (rest, scope) => {
        return eval_code(rest[0], scope)(...rest.slice(1).map(x => eval_code(x, scope)));
    },
    "n-construct": (rest, scope) => {
        return new eval_code(rest[0], scope)(...rest.slice(1).map(x => eval_code(x, scope)));
    }
};

const primitive_operators = {
    "+": (a, b) => (Number(a) + Number(b)).toString(),
    "-": (a, b) => (Number(a) - Number(b)).toString(),
    "*": (a, b) => (Number(a) * Number(b)).toString(),
    "/": (a, b) => (Number(a) / Number(b)).toString(),
    ">": (a, b) => mapBool(Number(a) > Number(b)),
    "<": (a, b) => mapBool(Number(a) < Number(b)),
    ">=": (a, b) => mapBool(Number(a) >= Number(b)),
    "<=": (a, b) => mapBool(Number(a) <= Number(b)),
};

function handleOperator(op, rest, scope) {
    const [first, second] = rest;
    const [ef, es] = [eval_code(first, scope), eval_code(second, scope)];
    return op(ef, es);
}

function eval_code(t, scope) {
    if (t instanceof Array) {
        if (t.length > 0) {
            const [first, ...rest] = t;
            if (first in primitive_functions) {
                return primitive_functions[first](rest, scope);
            }
            const def = findDefinition(first, scope);
            if (def) {
                return eval_code([def, ...rest], scope);
            }
            const variable = findVariable(first, scope);
            if (variable) {
                return variable;
            }
            if (first in primitive_operators) {
                return handleOperator(primitive_operators[first], rest, scope);
            }
            if (first instanceof Array) {
                if (first[0] && first[0].toString().toLowerCase() === "lambda") {
                    const args = rest.map((x) => eval_code(x, scope));
                    let [_, params, exp] = first;
                    if (!(params instanceof Array)) {
                        params = [params];
                    }
                    const argMap = args.reduce((accum, item, index) => {
                        accum[params[index]] = item;
                        return accum;
                    }, {});
                    const new_exp = replaceInExp(exp, argMap);
                    return eval_code(new_exp, scope);
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
        return findDefinition(t, scope) || findVariable(t, scope) || t;
    }
}

function replaceInExp(exp, args) {
    if (exp instanceof Array) {
        return exp.map((x) => replaceInExp(x, args));
    } else {
        return args[exp] || exp;
    }
}

const required_files = {};

function saveVariable(name, value, scope) {
    scope[scope.length - 1].variables[name] = value;
}

function saveDefinition(name, definition, scope) {
    scope[scope.length - 1].definitions[name] = definition;
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
