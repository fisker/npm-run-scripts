import colors from 'ansi-colors'
import enquirer from 'enquirer'
import {execa} from 'execa'
import getPackage from './get-package-json.js'
import exitWithMessage from './exit.js'

const {prompt} = enquirer

async function promptScripts() {
  const {scripts, file} = await getPackage()

  const questions = {
    type: 'autocomplete',
    name: 'answer',
    message: 'Choice a script to execute',
    limit: Math.min(scripts.length, 15),
    suggest(input, choices) {
      return choices.filter(({name}) =>
        name.toLowerCase().startsWith(input.toLowerCase()),
      )
    },
    choices: scripts,
  }

  console.log(`scripts in ${colors.cyan(file)}`)

  return prompt(questions)
}

async function runScript(client, name, options = {}) {
  const {scripts, file, folder} = await getPackage()

  if (!scripts.some(({name: scriptName}) => name === scriptName)) {
    exitWithMessage(
      `no script named ${colors.red(name)} in ${colors.cyan(file)}.`,
    )
  }

  const arguments_ = Object.entries(options)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? `--${key}` : ''
      }

      return `--${key} ${value}`
    })
    .filter(Boolean)

  return execa(client, ['run', name, ...arguments_], {
    stdio: 'inherit',
    folder,
  })
}

export {promptScripts as prompt, runScript as run}
