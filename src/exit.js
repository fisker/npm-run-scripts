import colors from 'ansi-colors'

function exitWithMessage(message) {
  process.exitCode = 1
  throw new Error(`${colors.red('ERROR')}: ${message}`)
}

export default exitWithMessage
