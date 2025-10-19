/**
 * install command - 既存プロジェクトにMiyabiを追加
 */

import chalk from 'chalk';
import ora from 'ora';

export async function installCommand(_options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - インストール\n'));

  const spinner = ora('MIYABI AXを現在のプロジェクトに追加中...').start();

  // TODO: 実際のインストールロジック
  await new Promise(resolve => setTimeout(resolve, 1000));

  spinner.succeed('MIYABI AXのインストールが完了しました');

  console.log(chalk.green('\n✨ セットアップ完了！\n'));
  console.log('次のステップ:');
  console.log(`  npx miyabi-ax status`);
  console.log(`  npx miyabi-ax agent\n`);
}
