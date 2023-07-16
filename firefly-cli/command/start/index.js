
const userHome = require('user-home');
const mkdirp = require('mkdirp');
const path = require('path');
const inquirer = require('inquirer');
const downloadServer = require('./downloadServer');
const chalk = require('chalk');
const portfinder = require('portfinder');
const ora = require('ora');
const open = require('open');
const spawn = require('cross-spawn');
const checkVersion = require('../../utils/checkVersion');
const parseArgs = require('../../utils/parseArgs');
const execa = require('execa');

const SPARROW_PATH = path.join(userHome, '.firefly');
const SERVER_PATH = path.join(SPARROW_PATH, 'firefly-service');


let commonOptions = {};
let mode = false;
let forbidupdate = false;

async function start(options = {}) {
  commonOptions = options;
  mode = options.mode;
  forbidupdate = options.forbidupdate || false;
  if (forbidupdate) {
    await startSparrowworks(options);
    return;
  }
  const pkgPath = path.join(SERVER_PATH, 'package.json');
  let packageConfig;

  try {
    // eslint-disable-next-line
    packageConfig = require(pkgPath);
  } catch (err) {
    await downloadServer();
    if (options.init === 'true') {
      console.log('Just download packages to init sparrow');
    } else {
      await startSparrowworks(options);
    }
    // const answers = await inquirer.prompt([
    //   {
    //     type: 'confirm',
    //     message: `${pkgPath} 不存在，请重新下载 sparrow-server！`,
    //     name: 'download',
    //     default: true,
    //   },
    // ]);
    // if (answers.download) {
    // } else {
    //   console.error(err);
    //   process.exit(1);
    // }
    return;
  }

  const packageName = packageConfig.name;
  const packageVersion = packageConfig.version;
  console.log(chalk.grey('sparrow Core:', packageVersion, SERVER_PATH));

  if (options.command === 'use') {
    if (!semver.valid(options.version)) {
      console.error('Invalid version specified');
      process.exit(1);
    }
    if (packageVersion !== options.version) {
      await downloadServer(options.version);
    }
  } else {
    const answers = await checkServerVersion(packageName, packageVersion);
    if (answers && answers.update) {
      await downloadServer();
    }
  }

  if (options.init === 'true') {
    console.log('Just download packages to init sparrow');
  } else {
    await startSparrowworks(options);
  }
}

// npm run start
async function startSparrowworks(options) {
  const host = options.host || 'http://localhost';

  let { port } = options;
  if (!port) {
    try {
      port = await portfinder.getPortPromise();
    } catch (error) {
      console.log('Find port error');
      console.log(error);
      console.log();
      process.exit(1);
    }
  }

  const opts = { host, port };
  const url = `${opts.host}:${opts.port}`;
  const spinner = ora('Starting Sparrow');

  const env = Object.create(process.env);
  env.PORT = opts.port;
  env.NODE_ENV = 'product';

  let [command, ...args] = parseArgs('nest start');
  const child = execa(
    path.join(SERVER_PATH, 'node_modules/.bin/nest'),
    args,
    {
      stdio: ['pipe'],
      cwd: SERVER_PATH,
      env,
    },
  );
  let started = false;
  child.stdout.on('data', (data) => {
    console.log(data.toString());

    if (data.toString().indexOf('successfully') !== -1) {
      console.log();
      spinner.stop();
      console.log();
      console.log('🚀  Start firefly successful');
      console.log();
      console.log(`👉  Ready on ${chalk.yellow('http://localhost:3000/')}`);
      console.log();
      started = true;
    } else if (started) {
      console.log(data.toString());
    }
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  child.on('error', (error) => {
    console.log();
    console.log('😞  Start sparrow failed');
    console.log();
    console.log(error);
    process.exit(1);
  });

  process.on('SIGINT', () => {});
}

/**
 * Get the server package version
 */
async function checkServerVersion(packageName, packageVersion) {
  const result = await checkVersion(packageName, packageVersion);

  if (result) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        message: 'A newer version of Sparrow core is available(CHANGELOG: \'\')',
        name: 'update',
        default: false,
      },
    ]);

    return answers;
  }
}

module.exports = (...args) => {
  return start(...args).catch((err) => {
    console.log(err);
    process.exit(1);
  });
};
