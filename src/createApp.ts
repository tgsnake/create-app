/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2022 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import prompts from 'prompts';
import { spawnSync } from 'child_process';

export async function createApp({
  route,
  pkgManager,
  typescript,
  redisSession,
  template,
}: {
  route: string;
  pkgManager: string;
  typescript: boolean;
  redisSession: boolean;
  template: string;
}) {
  console.log(chalk.green(`Creating tgsnake app in ./${route}`));
  if (/https:\/\/(git|github).com\/(.*)/.test(template)) {
    await spawnSync('git', ['clone', template, route], {
      encoding: 'utf8',
      stdio: 'inherit',
    });
    if (fs.existsSync(path.join(route, 'yarn.lock'))) {
      await spawnSync('yarn', ['install'], {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: route,
      });
    } else if (fs.existsSync(path.join(route, 'pnpm-lock.yaml'))) {
      await spawnSync('pnpm', ['install'], {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: route,
      });
    } else {
      await spawnSync('npm', ['install'], {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: route,
      });
    }
    if (!fs.existsSync(path.join(route, 'tgsnake.config.js'))) {
      let config = fs.readFileSync(
        path.join(__dirname, '../', '../', 'templates', 'config.txt'),
        'utf8'
      );
      const { apiHash } = await prompts({
        type: 'text',
        name: 'apiHash',
        message: 'api hash?',
      });
      const { apiId } = await prompts({
        type: 'number',
        name: 'apiId',
        message: 'api id?',
      });
      const { sessionName } = await prompts({
        type: 'text',
        name: 'sessionName',
        message: 'session name?',
      });
      const { ipv6 } = await prompts({
        type: 'confirm',
        name: 'ipv6',
        message: 'use ipv6?',
      });
      config = config
        .replace(
          '$IMPORT_RDS',
          redisSession ? "const { RedisSession } = require('@tgsnake/redis-session');" : ''
        )
        .replace('$API_HASH', apiHash)
        .replace('$API_ID', apiId)
        .replace('$CLIENT_OPTIONS', JSON.stringify({ ipv6 }))
        .replace(
          '$LOGIN',
          `{
        botToken : '',
        sessionName : '${sessionName}',
        forceDotSession : ${!redisSession},
        session : ${redisSession ? `new RedisSession('${sessionName}')` : 'undefined'}
      }`
        );
      fs.writeFileSync(path.join(route, 'tgsnake.config.js'), config);
    }
    if (process.platform === 'win32') {
      await spawnSync('CLS', [], { encoding: 'utf8', stdio: 'inherit' });
    } else {
      await spawnSync('clear', [], { encoding: 'utf8', stdio: 'inherit' });
    }
    console.log(chalk.blue(`Successfully creating your app in ./${route}!`));
    console.log(
      chalk.blue(
        `Next step is follow the instructions in README.md file if available and install missing dependencies.`
      )
    );
    console.log('\n\n');
  } else {
    if (fs.existsSync(route)) {
      if (fs.statSync(route).isDirectory()) {
        let content = fs.readdirSync(route);
        if (content.length) {
          console.error(chalk.red(`Cannot create app in directory containing content`));
          process.exit(1);
        }
      } else {
        console.error(chalk.red(`${route} is not a directory`));
        process.exit(1);
      }
    } else {
      fs.mkdirSync(route);
    }
    let dependencies: Array<string> = ['tgsnake@alpha'];
    let devDependencies: Array<string> = [];
    if (redisSession) {
      dependencies.push('@tgsnake/redis-session');
    }
    if (typescript) {
      devDependencies.push('typescript', '@types/node');
    }
    console.log(chalk.blue(`\nInstalling Dependencies:\n`));
    for (let dep of [...dependencies, ...devDependencies]) {
      console.log(chalk.blue(`  - ${dep}`));
    }
    if (pkgManager === 'yarn') {
      let major = 1;
      let minor = 0;
      let patch = 0;
      const { stdout } = await spawnSync('yarn', ['--version'], { encoding: 'utf8' });
      if (stdout) {
        let splited = stdout.split('.');
        if (splited[0]) {
          major = Number(splited[0]);
        }
        if (splited[1]) {
          minor = Number(splited[1]);
        }
        if (splited[2]) {
          patch = Number(splited[2]);
        }
      }
      // yarn berry
      if (major >= 2) {
        fs.writeFileSync(
          path.join(route, '.yarnrc.yml'),
          `defaultSemverRangePrefix: ''\nlockfileFilename: yarn.lock\nnodeLinker: node-modules`
        );
        await spawnSync('yarn', ['set', 'version', 'berry'], {
          encoding: 'utf8',
          cwd: route,
        });
      }
      fs.writeFileSync(path.join(route, 'yarn.lock'), '');
      fs.writeFileSync(
        path.join(route, 'package.json'),
        JSON.stringify({
          name: route.split('/').join('-'),
          version: '1.0.0',
          packageManager: `yarn@${major}.${minor}.${patch}`,
          ...(typescript ? { scripts: { build: 'tsc' } } : {}),
        })
      );
      await spawnSync('yarn', ['add', ...dependencies], {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: route,
      });
      if (devDependencies.length) {
        await spawnSync('yarn', ['add', '--dev', ...devDependencies], {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: route,
        });
      }
    } else if (pkgManager === 'npm') {
      fs.writeFileSync(
        path.join(route, 'package.json'),
        JSON.stringify({
          name: route.split('/').join('-'),
          version: '1.0.0',
          ...(typescript ? { scripts: { build: 'tsc' } } : {}),
        })
      );
      await spawnSync('npm', ['install', ...dependencies], {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: route,
      });
      if (devDependencies.length) {
        await spawnSync('npm', ['install', '--dev', ...devDependencies], {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: route,
        });
      }
    } else if (pkgManager === 'pnpm') {
      fs.writeFileSync(
        path.join(route, 'package.json'),
        JSON.stringify({
          name: route.split('/').join('-'),
          version: '1.0.0',
          ...(typescript ? { scripts: { build: 'tsc' } } : {}),
        })
      );
      await spawnSync('pnpm', ['install', ...dependencies], {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: route,
      });
      if (devDependencies.length) {
        await spawnSync('pnpm', ['install', '--dev', ...devDependencies], {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: route,
        });
      }
    } else {
      console.error(chalk.red(`unknown package manager: ${pkgManager}`));
      process.exit(1);
    }
    copy(path.join(__dirname, '../', '../', 'templates', 'base'), route);
    if (typescript) {
      copy(path.join(__dirname, '../', '../', 'templates', 'typescript', 'tsconfig.json'), route);
    }
    let config = fs.readFileSync(
      path.join(__dirname, '../', '../', 'templates', 'config.txt'),
      'utf8'
    );
    const { apiHash } = await prompts({
      type: 'text',
      name: 'apiHash',
      message: 'api hash?',
    });
    const { apiId } = await prompts({
      type: 'number',
      name: 'apiId',
      message: 'api id?',
    });
    const { sessionName } = await prompts({
      type: 'text',
      name: 'sessionName',
      message: 'session name?',
    });
    const { ipv6 } = await prompts({
      type: 'confirm',
      name: 'ipv6',
      message: 'use ipv6?',
    });
    config = config
      .replace(
        '$IMPORT_RDS',
        redisSession ? "const { RedisSession } = require('@tgsnake/redis-session');" : ''
      )
      .replace('$API_HASH', apiHash)
      .replace('$API_ID', apiId)
      .replace('$CLIENT_OPTIONS', JSON.stringify({ ipv6 }))
      .replace(
        '$LOGIN',
        `{
        botToken : '',
        sessionName : '${sessionName}',
        forceDotSession : ${!redisSession},
        session : ${redisSession ? `new RedisSession('${sessionName}')` : 'undefined'}
      }`
      );
    fs.writeFileSync(path.join(route, 'tgsnake.config.js'), config);
    fs.mkdirSync(path.join(route, 'src'));
    copy(
      path.join(
        __dirname,
        '../',
        '../',
        'templates',
        typescript ? 'typescript' : 'javascript',
        template
      ),
      path.join(route, 'src')
    );
    if (process.platform === 'win32') {
      await spawnSync('CLS', [], { encoding: 'utf8', stdio: 'inherit' });
    } else {
      await spawnSync('clear', [], { encoding: 'utf8', stdio: 'inherit' });
    }
    console.log(chalk.blue(`Successfully creating your app in ./${route}!`));
    console.log(chalk.blue(`Next Step:\n\n`));
    if (typescript) {
      console.log(chalk.bold(chalk.blue(` - cd ${route}`)));
      console.log(
        chalk.bold(chalk.blue(` - ${pkgManager} ${pkgManager === 'yarn' ? '' : 'run'} build`))
      );
      console.log(chalk.bold(chalk.blue(` - node dist`)));
    } else {
      console.log(chalk.bold(chalk.blue(` - cd ${route}`)));
      console.log(chalk.bold(chalk.blue(` - node src`)));
    }
    console.log('\n\n');
  }
}
function copy(from, to) {
  if (fs.statSync(from).isDirectory()) {
    for (const content of fs.readdirSync(from)) {
      copy(path.join(from, content), path.join(to, content));
    }
  } else {
    try {
      fs.copyFileSync(from, to);
    } catch (error) {
      let splited = from.split('/');
      splited.pop(); // the last element is file, so remove it
      if (!fs.existsSync(path.join(...splited))) {
        fs.mkdirSync(path.join(...splited));
        copy(from, to);
      } else {
        throw error;
      }
    }
  }
}
