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
    atom: (rest) => {
        const atom_elem = eval_code(rest[0]);
        if (atom_elem instanceof Array) {
            return atom_elem.length > 0 ? [] : true;
        } else {
            return true;
        }
    },
    eq: (rest) => {
        const [eq_first, eq_second] = [eval_code(rest[0]), eval_code(rest[1])];
        if (eq_first instanceof Array && eq_second instanceof Array) {
            const result = eq_first.length === eq_second.length && eq_first.length === 0;
            return result === true ? result : [];
        }
        const res = eq_first === eq_second;
        return res === true ? res : [];
    },
    car: (rest) => {
        const car_first = eval_code(rest[0]);
        return car_first[0];
    },
    cdr: (rest) => {
        const cdr_first = eval_code(rest[0]);
        if (!cdr_first) {
            return [];
        }
        return cdr_first.slice(1) || [];
    },
    cons: (rest) => {
        const [cons_first, cons_second] = [eval_code(rest[0]), eval_code(rest[1])];
        return [cons_first, ...cons_second];
    },
    cond: (rest) => {
        for (const cnd of rest) {
            const isValid = eval_code(cnd[0]) === true;
            if (isValid) {
                return eval_code(cnd[1]);
            }
        }
        return [];
    },
    defun: (rest) => {
        const [defun_name, defun_params, defun_exp] = rest;
        const defun_lambda = ["lambda", defun_params, defun_exp];
        saveDefinition(defun_name, defun_lambda);
        return null;
    },
    list: (rest) => {
        let ref = [];
        for (let i = rest.length - 1; i >= 0; i--) {
            ref = ["cons", rest[i], ref];
        }
        return eval_code(ref);
    },
    defvar: (rest) => {
        const dvName = rest[0];
        const dvValue = eval_code(rest[1]);
        saveVariable(dvName, dvValue);
        return null;
    },
    "require": (rest) => {
        const file = fs.readFileSync(eval_code(rest[0])).toString();
        const parsed = parse(file);
        parsed.forEach(eval_code);
    },
    "n-global": (rest) => {
        const g = global || window;
        return g[eval_code(rest[0])];
    },
    "n-require": (rest) => {
        return require(eval_code(rest[0]));
    },
    "n-callback": (rest) => {
        return (...args)=>{
            let [params, exp] = rest;
            if (!(params instanceof Array)) {
                params = [params];
            }
            const argMap = args.reduce((accum, item, index) => {
                accum[params[index]] = item;
                return accum;
            }, {});
            const new_exp = replaceInExp(exp, argMap);
            return eval_code(new_exp);
        };
    },
    "n-global-set": (rest) => {
        const g = global || window;
        const [f, v] = rest;
        const [field, value] = [eval_code(f), eval_code(v)];
        g[field] = value;
        return null;
    },
    "n-get": (rest) => {
        const [f, s] = rest;
        const [obj, prop] = [eval_code(f), eval_code(s)];
        const val = obj[prop];
        if (val && (val instanceof Function)) {
            return val.bind(obj);
        }
        return val;
    },
    "n-set": (rest) => {
        const [o, f, v] = rest;
        const [obj, field, value] = [eval_code(o), eval_code(f), eval_code(v)];
        obj[field] = value;
        return null;
    },
    "n-call": (rest) => {
        return eval_code(rest[0])(...rest.slice(1).map(x => eval_code(x)));
    },
    "n-construct": (rest) => {
        return new eval_code(rest[0])(...rest.slice(1).map(x => eval_code(x)));
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
            if (first in definitions) {
                return eval_code([definitions[first], ...rest]);
            }
            if (vars[first]) {
                return vars[first];
            }
            if (first in primitive_operators) {
                return handleOperator(primitive_operators[first], rest);
            }
            if (first instanceof Array) {
                if (first[0].toString().toLowerCase() === "lambda") {
                    const args = rest.map((x) => eval_code(x));
                    let [_, params, exp] = first;
                    if (!(params instanceof Array)) {
                        params = [params];
                    }
                    const argMap = args.reduce((accum, item, index) => {
                        accum[params[index]] = item;
                        return accum;
                    }, {});
                    const new_exp = replaceInExp(exp, argMap);
                    return eval_code(new_exp);
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
        return definitions[t] || vars[t] || t;
    }
}

function replaceInExp(exp, args) {
    if (exp instanceof Array) {
        return exp.map((x) => replaceInExp(x, args));
    } else {
        return args[exp] || exp;
    }
}

const definitions = {};
const vars = {};

function saveVariable(name, value) {
    vars[name] = value;
}

function saveDefinition(name, definition) {
    definitions[name] = definition;
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

module.exports = {
    eval_code,
    printItem
};
