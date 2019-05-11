import meow from 'meow'
import updateNotifier from 'update-notifier'
import colors from 'ansi-colors'
import run from '.'

updateNotifier({pkg: require('../package.json')}).notify()

const cli = meow(
  `
  Usage
    $ npm-run <script>
    $ yarn-run <script>
    $ nr <script>
    $ yr <script>

  Options
    --no-yarn ${colors.cyan('use npm instead of yarn')}

  Examples
    $ npm-run ${colors.cyan('build')}
`,
  {
    flags: {
      npm: {
        type: 'boolean',
      },
    },
  }
)

run(cli.input[0], cli.flags)
