var uglify = require('broccoli-uglify-sourcemap')
var esTranspiler = require('broccoli-babel-transpiler')
var pickFiles = require('broccoli-funnel')
var mergeTrees = require('broccoli-merge-trees')
var concat = require('broccoli-concat');
var env = require('broccoli-env').getEnv()
var rename = require('broccoli-stew').rename;
var watchify = require('broccoli-watchify');
var log = require('broccoli-stew').log;
var debug = require('broccoli-stew').debug;
var exportTree = require('broccoli-export-tree');
 
var watchifyBrowserOpts = {
  browserify: { entries: ['./browserEntry.js'], debug: true },
  outputFile: 'sf-models.js',
  cache: true,
};

var watchifyUglyBrowserOpts = {
  browserify: { entries: ['./browserEntry.js'], debug: false },
  outputFile: 'sf-models-min.js',
  cache: true,
};

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
  include: ['sf-models.js', 'browserEntry.js'],
  destDir: '.'
});

tool = esTranspiler(tool);

nodeTool = rename(tool, 'sf-models.js', 'sf-models-node.js');

var uglifiedTool = watchify(tool, watchifyUglyBrowserOpts);
uglifiedTool = rename(uglifiedTool, 'sf-models.js', 'sf-models-min.js');
uglifiedTool = uglify(uglifiedTool, { mangle: true, compress: true });

tool = watchify(tool, watchifyBrowserOpts);

tool = pickFiles(tool, { include: ['sf-models.js'] });
uglifiedTool = pickFiles(uglifiedTool, { include: ['sf-models-min.js'] });

var all = mergeTrees([
  uglifiedTool,
  tool,
  nodeTool,
  tests,
  testsStatic
]);

var dist = exportTree(all, {
  destDir: 'dist'
});

module.exports = mergeTrees([dist, all]);
