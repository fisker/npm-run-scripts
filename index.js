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
const promptOption = {
  type: 'autocomplete',
  name: 'answer',
  message: 'Choice a script to execute:',
  source(answers, input) {
    const choices = fuzzy
      .filter(input || '', scripts, {
        extract: ({name}) => name,
      })
      .map(({original}) => original)
      .map(({display, name}) => ({
        name: display,
        value: name,
        short: name,
      }))
    return Promise.resolve(choices)
  },
  pageSize: 10,
}

if (scriptName) {
  runScript(scriptName)
} else {
  promptScripts()
}

function getScripts() {
  const {pkg, path: file} = readPkgUp()

  if (!pkg) {
    exitWithMessage(
      `no ${chalk.green('package.json')} found in ${chalk.cyan(process.cwd())}.`
    )
  }

  let {scripts = {}} = pkg

  scripts = Object.keys(scripts).map((script, index) =>
    styleScript({
      name: script,
      command: scripts[script],
      index,
    })
  )

  if (scripts.length === 0) {
    exitWithMessage(`no scripts found in ${chalk.cyan(file)}.`)
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
  console.error(`no script named ${chalk.green(name)} in ${chalk.cyan(file)}.`)

  promptScripts()
}

function styleScript({name, command, index}) {
  const display = `${chalk.cyan(name)} ${chalk.gray(command)}`
  return {
    name,
    command,
    display,
    index,
  }
}

function promptScripts() {
  console.log(`scripts in ${chalk.cyan(file)}`)

  return inquirer.prompt(promptOption).then(({answer}) => runScript(answer))
}

function exitWithMessage(msg) {
  console.log(`${chalk.red('ERROR')}: ${msg}`)

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}
