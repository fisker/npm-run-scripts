import {sync as readPackageUp} from 'read-pkg-up'
import colors from 'ansi-colors'
import path from 'path'
import exitWithMessage from './exit'

function scriptMessage(name, cmd) {
  return `${colors.bold(name)} ${colors.gray(cmd)}`
}

function getPackage() {
  const {packageJson: package_, path: file} = readPackageUp()

  if (!package_) {
    exitWithMessage(
      `no ${colors.green('package.json')} found in ${colors.cyan(
        process.cwd()
      )}.`
    )
  }

  const {scripts = {}} = package_

  const commands = Object.keys(scripts).map((script, index) => ({
    name: script,
    message: scriptMessage(script, scripts[script]),
    command: scripts[script],
    index,
    value: script,
  }))

  const folder = path.dirname(file)

  if (commands.length === 0) {
    exitWithMessage(`no scripts found in ${colors.cyan(file)}.`)
  }

  return {pkg: package_, file, folder, scripts: commands}
}

export default getPackage
