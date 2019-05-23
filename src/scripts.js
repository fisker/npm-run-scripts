import colors from 'ansi-colors'
import {prompt} from 'enquirer'
import execa from 'execa'
import getPackage from './get-package-json'
import exitWithMessage from './exit'

function promptScripts() {
  const {scripts, file} = getPackage()

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
    choices: scripts,
  }

  console.log(`scripts in ${colors.cyan(file)}`)

  return prompt(questions)
}

function runScript(client, name, options = {}) {
  const {scripts, file, folder} = getPackage()

  if (!scripts.some(({name: scriptName}) => name === scriptName)) {
    exitWithMessage(
      `no script named ${colors.red(name)} in ${colors.cyan(file)}.`
    )
  }

  const arguments_ = Object.entries(options).map(
    ([key, value]) => `--${key} ${value}`
  )

  return execa(client, ['run', name, ...arguments_], {
    stdio: 'inherit',
    folder,
  })
}

export {promptScripts as prompt, runScript as run}
