/**
 * todos command - TODOコメント自動検出・Issue化
 */

import chalk from 'chalk';

export async function todosCommand(_options: any): Promise<void> {
  console.log(chalk.cyan('\n📝 MIYABI AX - TODO検出\n'));

  console.log(chalk.gray('TODO: TODO検出機能実装予定'));
  console.log(chalk.gray('  - ソースコード内のTODOコメント検出'));
  console.log(chalk.gray('  - 自動Issue作成（--create-issues）'));
  console.log();
}
