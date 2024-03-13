#!/usr/bin/env node
/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2022 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import path from 'path';
import packageJson from '../package.json';
import * as helpers from './helpers';
import { createApp } from './createApp';

let projectPath = '';
const program = new Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} ${chalk.blue('[options]')}`)
  .action((name) => {
    projectPath = name.trim();
  })
  .option('--ts, --typescript', chalk.blue('Initialize typescript project.'))
  .option('--yarn, --use-yarn', chalk.blue('Initialize project using yarn.'))
  .option('--npm, --use-npm', chalk.blue('Initialize project using npm.'))
  .option('--pnpm, --use-pnpm', chalk.blue('Initialize project using pnpm.'))
  .option('--rds, --use-redis-session', chalk.blue('Initialize project using redis session.'))
  .option(
    '--template <template>',
    chalk.blue('Initialize project with available template "simple" or "composer".'),
  )
  .parse(process.argv)
  .opts();

const pkgManager = program.useYarn
  ? 'yarn'
  : program.useNpm
    ? 'npm'
    : program.usePnpm
      ? 'pnpm'
      : helpers.getPkgManager();

if (program.template) {
  const validTemplate = ['simple', 'composer'];
  if (
    !validTemplate.includes(program.template.toLowerCase()) &&
    !/https:\/\/(git|github).com\/(.*)/.test(program.template.toLowerCase())
  ) {
    console.error(chalk.red("Template should be 'simple' or 'composer' or git(hub)? repository!"));
    process.exit(1);
  }
}

createApp({
  route: path.join(String(projectPath).trim()),
  typescript: program.typescript ?? false,
  redisSession: program.useRedisSession ?? false,
  template: program.template || 'simple',
  pkgManager,
});
