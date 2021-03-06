var uglify = require('broccoli-uglify-sourcemap');
var esTranspiler = require('broccoli-babel-transpiler');
var pickFiles = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var env = require('broccoli-env').getEnv();
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
  browserify: { entries: ['./tests.js'], debug: true },
  outputFile: 'tests.js',
  cache: true,
};

var testsStatic = pickFiles('./tests', {
  include: ['tests.html', 'tests-min.html'],
  destDir: '.'
});

var tests = pickFiles('./tests', {
  include: ['tests.js'],
  destDir: '.'
});

var qunit = pickFiles('./node_modules/qunitjs/qunit', {
  include: ['qunit.js', 'qunit.css'],
  destDir: './qunit'
});

var deps = mergeTrees([
  pickFiles('./tests/deps', { destDir: './deps'}),
  pickFiles('node_modules/ember-data/ember-data', { include: ['ember-data.js'], destDir: './deps'})
]);

tests = esTranspiler(tests);
tests = watchify(tests, watchifyBrowserTestsOpts);

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
  testsStatic,
  deps,
  qunit
]);

var dist = exportTree(all, {
  destDir: 'dist'
});

module.exports = mergeTrees([dist, all]);
