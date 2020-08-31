#!/usr/bin/node
const run = require("./src/repl");

function start() {
    let args = [...process.argv.slice(2) ];
    if (args.length == 0) {
        args = ["repl"];
    } else if (args.length === 1) {
        if (!["repl", "run"].includes(args[0])) {
            args = ["run", args[0]];
        }
    } else {
        if (!["repl", "run"].includes(args[0])) {
            args = ["run", args[1]];
        }
    }
    run(args).catch(console.log);
}

start();
