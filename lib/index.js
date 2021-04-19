import {prompt, run as runScript} from './scripts.js'
import cli from './cli.js'

async function main(script, options = {}) {
  const client = options.noYarn ? 'npm' : 'yarn'

  if (script) {
    const {noYarn, ...runOptions} = options
    runScript(client, script, runOptions)
  } else {
    const {answer: script} = await prompt(options)
    runScript(client, script)
  }
}

async function run() {
  return main(cli.input[0], cli.flags)
}

export default run
