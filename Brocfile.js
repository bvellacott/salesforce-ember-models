var uglify = require('broccoli-uglify-sourcemap')
var esTranspiler = require('broccoli-babel-transpiler')
var pickFiles = require('broccoli-funnel')
var mergeTrees = require('broccoli-merge-trees')
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

var watchifyBrowserTestsOpts = {
  browserify: { entries: ['./testRunner.js'], debug: true },
  outputFile: 'tests.js',
  cache: true,
};

var tests = pickFiles('./tests', {
  include: ['tests.js', 'tests.html', 'tests-min.html'],
  destDir: '.'
});

var qunit = pickFiles('./node_modules/qunitjs/qunit', {
  // include: ['tests.js', 'testRunner.js', 'tests.html', 'tests-min.html','browserTestHeader.js','browserTestFooter.js'],
  include: ['qunit.js', 'qunit.css'],
  destDir: './qunit'
});


tests = esTranspiler(tests);

var tool = pickFiles('./dev', {
  include: ['sf-models.js', 'browserEntry.js'],
  destDir: '.'
});

tool = esTranspiler(tool);

nodeTool = rename(tool, 'sf-models.js', 'sf-models-node.js');
nodeTool = pickFiles(nodeTool, { include: ['sf-models-node.js']});

var uglifiedTool = watchify(tool, watchifyUglyBrowserOpts);
uglifiedTool = uglify(uglifiedTool, { mangle: true, compress: true });

tool = watchify(tool, watchifyBrowserOpts);
// tool = pickFiles(tool, { include: ['sf-models.js'] });

var all = mergeTrees([
  uglifiedTool,
  tool,
  nodeTool,
  tests,
  qunit
]);

var dist = exportTree(all, {
  destDir: 'dist'
});

module.exports = mergeTrees([dist, all]);
