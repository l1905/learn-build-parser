/**
 * Main test runner
 */
const {Parser} = require("../src/Parser");
const assert = require("assert")

const tests = [
    require('./literals-test'),
    require('./statement-list-test'),
    require('./block-test'),
    require('./empty-statement-test'),
    require('./math-test'),
    require('./assignment-test'),
    require('./variable-test'),
];

const parser = new Parser();

/**
 * For manual tests
 */
function exec() {
    const program = `
    let y;
    let a,b;
    let c,d = 10;
    let x = 42;
    let foo=bar=10;
    r = 10;
    `;
    const ast = parser.parse(program);

    console.log(JSON.stringify(ast, null, 2));
}

// manual test;
exec();

function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

// run all tests
tests.forEach(testRun => testRun(test));

console.log("All assertions passed!");





