import {prompt, run} from './scripts'

function main(script, options = {}) {
  const client = options.noYarn ? 'npm' : 'yarn'

  if (script) {
    const {noYarn, ...runOptions} = options
    run(client, script, runOptions)
  } else {
    prompt(options).then(({answer: script}) => run(client, script), () => {})
  }
}

export default main
