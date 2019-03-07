#!/usr/bin/env node

const path = require('path')
const {prompt} = require('enquirer')
const colors = require('ansi-colors')
const execa = require('execa')
const hasYarn = require('has-yarn')
const readPkgUp = require('read-pkg-up').sync

const NPM_CLIENT = hasYarn() ? 'yarn' : 'npm'

const scriptName = process.argv[2]
const {scripts, folder, file} = getScripts()

const choices = scripts

const questions = {
  type: 'autocomplete',
  name: 'answer',
  message: 'Choice a script to execute',
  limit: Math.min(scripts.length, 15),
  suggest(input, choices) {
    return choices.filter(({name}) =>
      name.toLowerCase().startsWith(input.toLowerCase())
    )
  },
  choices,
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
      `no ${colors.green('package.json')} found in ${colors.cyan(
        process.cwd()
      )}.`
    )
  }

  let {scripts = {}} = pkg

  scripts = Object.keys(scripts).map((script, index) => ({
    name: script,
    message: scriptMessage(script, scripts[script]),
    command: scripts[script],
    index,
    value: script,
  }))

  if (scripts.length === 0) {
    exitWithMessage(`no scripts found in ${colors.cyan(file)}.`)
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
  console.error(
    `no script named ${colors.green(name)} in ${colors.cyan(file)}.`
  )

  promptScripts()
}

function scriptMessage(name, cmd) {
  return `${colors.bold(name)} ${colors.gray(cmd)}`
}

function promptScripts() {
  console.log(`scripts in ${colors.cyan(file)}`)

  return prompt(questions).then(
    ({answer}) => runScript(answer),
    () => console.log('canceled')
  )
}

function exitWithMessage(msg) {
  console.log(`${colors.red('ERROR')}: ${msg}`)

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}
