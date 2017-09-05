var inquirer = require('inquirer')
var inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt')
var fuzzy = require('fuzzy');
var spawn = require('cross-spawn')
var dir = process.cwd()
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
  name: 'command',
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
  var command = answers.command;

  if (!scripts[command]) {
    process.stderr.write('ERROR: No script with name "' + command + '" was found!');
    process.exit(1);
  }

  var npm = spawn('npm', ['run', answers.command], {
    cwd: dir,
  })

  npm.stdout.pipe(process.stdout)
	npm.stderr.pipe(process.stderr)
});