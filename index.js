var CWD = process.cwd()
var spawn = require('cross-spawn')
var scriptName = process.argv[2]
var scripts = getScripts()

if (scriptName) {
  runNpmScript(scriptName)
} else {
  promptScripts(scripts).then(runNpmScript)
}

function promptScripts(scripts) {
  var inquirer = require('inquirer')
  var inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt')
  var fuzzy = require('fuzzy')
  var Promise = global.Promise || require('es6-promise').Promise

  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt)

  return inquirer
    .prompt({
      type: 'autocomplete',
      name: 'script',
      message: 'Choice a script to run',
      source: function(answers, input) {
        var result = fuzzy.filter(input || '', scripts)
        result = result.map(function(el) {
          return el.original
        })
        return Promise.resolve(result)
      },
      pageSize: 10
    })
    .then(function(answers) {
      return answers.script
    })
}

function showError(msg) {
  process.stderr.write('ERROR: ' + msg)
  process.exit(1)
}

function getScripts() {
  var join = require('path').join
  var pkg
  var scriptKeys

  try {
    pkg = require(join(CWD, 'package.json'))
  } catch (err) {
    showError('No package.json found!')
  }

  var scripts = pkg.scripts

  if (!scripts || typeof scripts !== 'object') {
    showError('No scripts found!')
  }

  var scriptKeys = Object.keys(scripts)

  if (!scriptKeys.length) {
    showError('No scripts found!')
  }

  return scriptKeys
}

function runNpmScript(scriptName) {
  if (!scripts.includes(scriptName)) {
    process.stderr.write('ERROR: missing script: ' + scriptName + '')
    process.exit(1)
  }

  spawn('npm', ['run', scriptName], {
    stdio: 'inherit',
    cwd: CWD
  })
}
