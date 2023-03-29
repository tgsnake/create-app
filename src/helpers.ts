/**
 * tgsnake - Telegram MTProto framework for nodejs.

 * Copyright (C) 2022 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export function getPkgManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.startsWith('yarn')) {
      return 'yarn';
    } else if (userAgent.startsWith('pnpm')) {
      return 'pnpm';
    } else {
      return 'npm';
    }
  } else {
    return 'npm';
  }
}
