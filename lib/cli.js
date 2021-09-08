import meow from 'meow'
import updateNotifier from 'update-notifier'
import colors from 'ansi-colors'
import createEsmUtils from 'esm-utils'

const {json} = createEsmUtils(import.meta)

updateNotifier({pkg: json.loadSync('../package.json')}).notify()

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
    importMeta: import.meta,
    flags: {
      noYarn: {
        type: 'boolean',
      },
    },
  },
)

export default cli
