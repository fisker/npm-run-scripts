import colors from 'ansi-colors'
import {prompt} from 'enquirer'
import execa from 'execa'
import getPackage from './get-package-json'
import exitWithMessage from './exit'

const {file, scripts, folder} = getPackage()

function promptScripts() {
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

  console.log(`scripts in ${colors.cyan(file)}`)

  return prompt(questions)
}

function runScript(client, name) {
  if (!scripts.some(({name: scriptName}) => name === scriptName)) {
    exitWithMessage(
      `no script named ${colors.red(name)} in ${colors.cyan(file)}.`
    )
  }

  return execa(client, ['run', name], {
    stdio: 'inherit',
    folder,
  })
}

export {promptScripts as prompt, runScript as run}
