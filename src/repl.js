const readline = require('readline');
const chalk = require('chalk');

const {
    eval_code,
    printItem
} = require('./interpreter');
const parse = require('./parser');
const fs = require('fs');

const commands = {
    commands: [],
    index: 0
};
let rl;

function readInput(filename) {
    if (filename) {
        try {
            const buffer = fs.readFileSync(filename);
            return buffer.toString();
        } catch (err) {
            console.log("Error: ", err.message);
        }
    }
    return null;
}

function lex_eval_parse(code, initialScope) {
    try {
        const parsed = parse(code);
        const result = parsed.map(x => {
            try {
                const result = eval_code(x, initialScope);
                if (result) {
                    return {
                        success: true,
                        message: printItem(result)
                    };
                }
                return null;
            } catch (err) {
                return {
                    succewss: false,
                    message: err.message,
                };
            }
        }).filter(x => x !== null);
        result.filter(x => x !== null && x !== undefined).forEach(x => {
            if (x.success) {
                console.log(chalk.green(x.message));
            } else {
                console.log(chalk.red("Error: ", x.message));
            }
        });
    } catch (err) {
        if (err.message === "Unbalanced parantheses!") {
            throw err;
        }
        console.log("Error: ", err.message);
    }
}

async function repl_cycle(scope) {
    let incomplete = true;
    let full_answer = "";
    let initial = true;
    while (incomplete) {
        const answer = await read(initial ? "LISP>> " : "...");
        initial = false;
        full_answer += answer;
        try {
            lex_eval_parse(full_answer, scope);
            if (full_answer) {
                commands.commands.splice(0, 0, full_answer);
            }
            commands.index = 0;
            incomplete = false;
        } catch (err) {
            incomplete = true;
        }
    }
    repl_cycle(scope);
}

async function read(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            // rl.close();
            resolve(answer);
        });
    });
}

async function run(args) {
    const repl = args[0] === 'repl';
    const initialScope = [{
        definitions: {},
        variables: {}
    }];
    let input = readInput(args[1]);
    if (input) {
        lex_eval_parse(input, initialScope);
    }
    if (repl) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        await repl_cycle(initialScope);
    }
}

module.exports = run;
