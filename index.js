var dir = process.cwd()
var spawn = require('cross-spawn')

if (process.argv[2]) {
  runNpmScript(process.argv[2])
} else {
  var inquirer = require('inquirer')
  var inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt')
  var fuzzy = require('fuzzy');
  var join = require('path').join
  var Promise = global.Promise || require('es6-promise').Promise

  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt)

  var scripts = require(join(dir, 'package.json')).scripts
  var keys = Object.keys(scripts);

  if (!scripts) {
    process.stderr.write('ERROR: No scripts found!')
    process.exit(1)
  }

  inquirer.prompt({
    type: 'autocomplete',
    name: 'script',
    message: 'Choice a script to run?',
    source: function(answers, input) {
      var result = fuzzy.filter(input || '', keys);
      result = result.map(function(el) {
        return el.original
      })
      return Promise.resolve(result)
    },
    pageSize: 10
  }).then(function(answers) {
    var script = answers.script;

    if (!scripts[script]) {
      process.stderr.write('ERROR: missing script: ' + script + '');
      process.exit(1);
    }

    runNpmScript(script)
  });
}

function runNpmScript(script) {
  var npm = spawn('npm', ['run', script], {
    cwd: dir,
  })

  npm.stdout.pipe(process.stdout)
	npm.stderr.pipe(process.stderr)
}