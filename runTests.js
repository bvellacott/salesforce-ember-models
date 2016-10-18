var testrunner = require("qunit");

testrunner.setup(
{
    // logging options
    log: {
 
        // log assertions overview 
        assertions: true,
 
        // log expected and actual values for failed tests 
        errors: true,
 
        // log tests overview 
        tests: true,
 
        // log summary 
        summary: true,
 
        // log global summary (all files) 
        globalSummary: true,
 
        // log coverage 
        coverage: true,
 
        // log global coverage (all files) 
        globalCoverage: true,
 
        // log currently testing code file 
        testing: true
    },
 
    // run test coverage tool 
    coverage: true,
 
    // define dependencies, which are required then before code 
    deps: null,
 
    // define namespace your code will be attached to on global['your namespace'] 
    namespace: 'SFModels',
 
    // max amount of ms child can be blocked, after that we assume running an infinite loop 
    maxBlockDuration: 2000
});

// one code and tests file 
testrunner.run({
    deps: [{path: 'ember-data', namespace: "DS"}, 'mocks'/*{path: 'mocks', namespace: 'mocks'}*/],
    // deps: {path: 'ember-data', namespace: "DS"},
    code: { path: "dist/sf-models-node.js", namespace: 'SFModels'},
    tests: "tests/tests.js"
}, function(){ console.log('done'); });