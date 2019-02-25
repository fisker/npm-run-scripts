const path = require('path')
const inquirer = require('inquirer')
const fuzzy = require('fuzzy')
const chalk = require('chalk')
const execa = require('execa')
const hasYarn = require('has-yarn')()
const inquirerAutocompletePrompt = require('inquirer-autocomplete-prompt')
const readPkgUp = require('read-pkg-up').sync

const NPM_CLIENT = hasYarn ? 'yarn' : 'npm'

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt)

const scriptName = process.argv[2]
const {scripts, folder, file} = getScripts()

if (scriptName) {
  runScript(scriptName)
} else {
  promptScripts()
}

function getScripts() {
  const {pkg, path: file} = readPkgUp()

  if (!pkg) {
    exitWithMessage(
      `no ${chalk.green('package.json')} found in ${chalk.blue(process.cwd())}.`
    )
  }

  let {scripts = {}} = pkg

  scripts = Object.keys(scripts).map(script =>
    styleScript({
      name: script,
      command: scripts[script],
    })
  )

  if (scripts.length === 0) {
    exitWithMessage(`no scripts found in ${chalk.blue(file)}.`)
  }

  const folder = path.dirname(file)

  return {
    scripts,
    folder,
    file,
  }
}

function runScript(cmd) {
  if (!scripts.some(({name}) => name === cmd)) {
    return noScriptFound(cmd)
  }

  return execa(NPM_CLIENT, ['run', cmd], {
    stdio: 'inherit',
    folder,
  })
}

function noScriptFound(name) {
  console.error(`no script named [${chalk.red(name)}] in ${chalk.green(file)}.`)

  promptScripts()
}

function styleScript({name, command}) {
  const display = `${chalk.green(name)} ${chalk.gray(command)}`
  return {
    name,
    command,
    display,
  }
}

function promptScripts() {
  console.log(`scripts in ${chalk.blue(file)}`)

  return inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'answer',
        message: `Choice a script from to run:`,
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
  console.log(`${chalk.red('ERROR')}: ${msg}`)

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}
