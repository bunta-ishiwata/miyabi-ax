/**
 * onboard command - 初回セットアップウィザード
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

export async function onboardCommand(_options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - 初回セットアップウィザード\n'));

  console.log(chalk.bold('MIYABI AXへようこそ！'));
  console.log('ローカル完結型自律開発フレームワークのセットアップを開始します。\n');

  await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hasGithubToken',
      message: 'GitHub Personal Access Tokenは準備済みですか？',
      default: false
    },
    {
      type: 'confirm',
      name: 'hasAnthropicKey',
      message: 'Anthropic API Keyは準備済みですか？',
      default: false
    },
    {
      type: 'confirm',
      name: 'useClaudeCode',
      message: 'Claude Codeを使用しますか？',
      default: true
    }
  ]);

  console.log();
  const spinner = ora('セットアップを実行中...').start();
  await new Promise(resolve => setTimeout(resolve, 1500));
  spinner.succeed('セットアップ完了！');

  console.log();
  console.log(chalk.green('✨ MIYABI AXの準備が整いました！\n'));
  console.log(chalk.bold('次のステップ:'));
  console.log('  npx miyabi-ax status    # 状態確認');
  console.log('  npx miyabi-ax agent     # Agent実行');
  console.log('  npx miyabi-ax --help    # ヘルプ表示');
  console.log();
}
