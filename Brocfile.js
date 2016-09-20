// var browserify = require('broccoli-browserify')
var uglify = require('broccoli-uglify-sourcemap')
var esTranspiler = require('broccoli-babel-transpiler')
var pickFiles = require('broccoli-funnel')
var mergeTrees = require('broccoli-merge-trees')
var concat = require('broccoli-concat');
var env = require('broccoli-env').getEnv()
var rename = require('broccoli-stew').rename;

// Tests
var testsStatic = pickFiles('./tests', {
  include: ['tests.html', 'tests-min.html', 'lib/*', 'fixtures/*', 'css/*'],
  destDir: '.'
});

var tests = pickFiles('./tests', {
  include: ['tests.js', 'tests.html', 'tests-min.html', 'browserTestHeader.js', 'browserTestFooter.js'],
  destDir: '.'
});

tests = esTranspiler(tests);

tests = concat(tests, {
  // header: "var module = {};",
  headerFiles: ['browserTestHeader.js'],
  outputFile: './tests.js',
  inputFiles: ['./tests.js'],
  footerFiles: ['browserTestFooter.js'],
  // footer: "module.exports(QUnit.test, $, Smack);",
  sourceMapConfig: { enabled: true },
});

var tool = pickFiles('./dev', {
  include: ['sf-models.js'],
  destDir: '.'
});

tool = esTranspiler(tool);
nodeTool = rename(tool, 'sf-models.js', 'sf-models-node.js');

tool = mergeTrees([
  tool,
  pickFiles('./dev', {
    include: ['browserHeader.js', 'browserFooter.js'],
    destDir: '.'
  })
]);

tool = concat(tool, {
  header: "(function(){",
  headerFiles: ['./browserHeader.js'],
  outputFile: './sf-models.js',
  footerFiles: ['./browserFooter.js'],
  footer: "})();",
  inputFiles: ['./sf-models.js'],
  sourceMapConfig: { enabled: true },
});

tool = pickFiles(tool, {
  include: ['sf-models.js', 'sf-models.map'],
});

var toolMin = rename(tool, 'sf-models.js', 'sf-models-min.js');

toolMin = uglify(toolMin, {
   mangle: true,
   compress: true
});

var all = mergeTrees([
  toolMin,
  tool,
  nodeTool,
  tests,
  testsStatic
]);

module.exports = all;
