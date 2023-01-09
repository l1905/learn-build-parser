#!/usr/bin/env node

'user strict';

const fs = require("fs");
const {Parser} = require("../src/Parser");

function main(argv) {
    const [_node, _path, mode, exp] = argv;
    const parser = new Parser();

    let ast = null;

    if(mode === "-e") {
        ast = parser.parse(exp);
    }
    if(mode === "-f") {
        const src = fs.readFileSync(exp, "utf-8");
        ast = parser.parse(src);
    }
    console.log(JSON.stringify(ast, null, 2));
}

main(process.argv);

/**
 * 
 * ./bin/letter-rdp.js -e "2+2;"
 * ./bin/letter-rdp.js -f __test__/example.lt
 */