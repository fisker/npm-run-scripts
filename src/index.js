import {prompt, run} from './scripts'

function main(script, options = {}) {
  const client = options.noYarn ? 'npm' : 'yarn'

  if (script) {
    run(client, script)
  } else {
    prompt(options).then(({answer}) => run(client, answer), () => {})
  }
}

export default main
