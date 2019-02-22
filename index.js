const path = require('path')
const inquirer = require('inquirer')
const fuzzy = require('fuzzy')
const chalk = require('chalk')
const execa = require('execa')
const hasYarn = require('has-yarn')()
const inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt')
const readPkgUp = require('read-pkg-up').sync

const NPM_CLIENT_CMD = hasYarn ? 'yarn' : 'npm'

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt)

const scriptName = process.argv[2]
const {scripts, cwd} = getScripts()

if (scriptName) {
  runScript(scriptName)
} else {
  promptScripts()
}

function getScripts() {
  const {pkg, path: file} = readPkgUp()

  if (!pkg) {
    exitWithMessage(`no package.json found.`)
  }

  let {scripts = {}} = pkg

  scripts = Object.keys(scripts).map(script =>
    styleScript({
      name: script,
      command: scripts[script],
    })
  )

  if (scripts.length === 0) {
    exitWithMessage('Cannot find any scripts in package.json')
  }

  const cwd = path.dirname(file)

  return {
    scripts,
    cwd,
  }
}

function runScript(cmd) {
  if (!scripts.some(({name}) => name == cmd)) {
    return noScriptFound(cmd)
  }

  return execa(NPM_CLIENT_CMD, ['run', cmd], {
    stdio: 'inherit',
    cwd,
  })
}

function noScriptFound(name) {
  console.error(`Cannot find any script named ${chalk.red(name)}\n`)

  promptScripts()
}

function styleScript({name, command}) {
  const display = `${chalk.bold.green(name)}  ${chalk.gray(command)}`
  return {
    name,
    command,
    display,
  }
}

function promptScripts() {
  return inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'answer',
        message: 'Choice a script to run:',
        source(answers, input) {
          const choices = fuzzy
            .filter(input || '', scripts, {extract: ({name}) => name})
            .map(({original}) => original.display)
          return Promise.resolve(choices)
        },
        pageSize: 10,
      },
    ])
    .then(({answer}) => scripts.filter(({display}) => display === answer)[0])
    .then(({name}) => runScript(name))
}

function exitWithMessage(msg) {
  throw new Error(`${chalk.bold.red('ERROR')}: ${msg}`)
}
