import {prompt, run} from './scripts'

function main(command, script, options) {
  if (script) {
    run(script, options)
  } else {
    prompt(options)
  }
}

export default main
