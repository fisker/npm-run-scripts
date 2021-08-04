import process from 'node:process'
import colors from 'ansi-colors'

function exitWithMessage(message) {
  console.log(`${colors.red('ERROR')}: ${message}`)
  process.exit(0)
}

export default exitWithMessage
