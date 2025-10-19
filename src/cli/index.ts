#!/usr/bin/env node

/**
 * MIYABI AX - CLI Tool
 * 元のmiyabiと同じコマンド構造
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { VERSION } from '../index.js';

/**
 * Detect if running in Claude Code environment
 */
function isClaudeCodeEnvironment(): boolean {
  return (
    process.env.CLAUDE_CODE === 'true' ||
    process.env.ANTHROPIC_CLI === 'true' ||
    process.env.TERM_PROGRAM === 'Claude' ||
    !!process.env.ANTHROPIC_API_KEY
  );
}

/**
 * Check if running in interactive terminal
 */
function isInteractiveTerminal(): boolean {
  return process.stdin.isTTY && process.stdout.isTTY && !isClaudeCodeEnvironment();
}

const program = new Command();

program
  .name('miyabi-ax')
  .description('✨ Miyabi AX - ローカル完結型自律開発フレームワーク')
  .version(VERSION, '-V, --version', 'output the version number')
  .option('--json', 'Output in JSON format (for AI agents)')
  .option('-y, --yes', 'Auto-confirm all prompts (non-interactive mode)')
  .option('-v, --verbose', 'Verbose output with detailed logs')
  .option('--debug', 'Debug mode with extra detailed logs');

// init command - 新しいプロジェクトを作成
program
  .command('init')
  .description('新しいプロジェクトを作成')
  .argument('<project-name>', 'プロジェクト名')
  .option('-p, --private', 'プライベートリポジトリとして作成')
  .option('--skip-install', 'npm installをスキップ')
  .option('--json', 'JSON形式で出力')
  .option('-y, --yes', 'すべてのプロンプトを自動承認')
  .action(async (projectName: string, options: any) => {
    const { initCommand } = await import('./commands/init.js');
    await initCommand(projectName, options);
  });

// install command - 既存プロジェクトにMiyabiを追加
program
  .command('install')
  .description('既存プロジェクトにMiyabiを追加')
  .option('--json', 'JSON形式で出力')
  .option('-y, --yes', 'すべてのプロンプトを自動承認')
  .action(async (options: any) => {
    const { installCommand } = await import('./commands/install.js');
    await installCommand(options);
  });

// status command - プロジェクトの状態を確認
program
  .command('status')
  .description('プロジェクトの状態を確認')
  .option('--json', 'JSON形式で出力')
  .option('-w, --watch', 'リアルタイム監視モード')
  .action(async (options: any) => {
    const { statusCommand } = await import('./commands/status.js');
    await statusCommand(options);
  });

// agent command - Agent実行・管理
program
  .command('agent')
  .description('🤖 Agent実行・管理')
  .option('--issue <number>', 'Issue番号を指定')
  .option('--json', 'JSON形式で出力')
  .option('-y, --yes', 'すべてのプロンプトを自動承認')
  .action(async (options: any) => {
    const { agentCommand } = await import('./commands/agent.js');
    await agentCommand(options);
  });

// auto command - 全自動モード
program
  .command('auto')
  .description('🕷️  全自動モード - Water Spider Agent起動')
  .option('--interval <minutes>', '実行間隔（分）', '30')
  .option('--json', 'JSON形式で出力')
  .action(async (options: any) => {
    const { autoCommand } = await import('./commands/auto.js');
    await autoCommand(options);
  });

// todos command - TODOコメント自動検出・Issue化
program
  .command('todos')
  .description('📝 TODOコメント自動検出・Issue化')
  .option('--create-issues', 'Issue自動作成')
  .option('--json', 'JSON形式で出力')
  .action(async (options: any) => {
    const { todosCommand } = await import('./commands/todos.js');
    await todosCommand(options);
  });

// config command - 設定を管理
program
  .command('config')
  .description('設定を管理')
  .option('--set <key=value>', '設定値をセット')
  .option('--get <key>', '設定値を取得')
  .option('--list', 'すべての設定を表示')
  .option('--json', 'JSON形式で出力')
  .action(async (options: any) => {
    const { configCommand } = await import('./commands/config.js');
    await configCommand(options);
  });

// setup command - セットアップガイドを表示
program
  .command('setup')
  .description('セットアップガイドを表示')
  .option('--json', 'JSON形式で出力')
  .action(async (options: any) => {
    const { setupCommand } = await import('./commands/setup.js');
    await setupCommand(options);
  });

// doctor command - システムヘルスチェックと診断
program
  .command('doctor')
  .description('システムヘルスチェックと診断')
  .option('--json', 'JSON形式で出力')
  .option('--fix', '自動修復を試みる')
  .action(async (options: any) => {
    const { doctorCommand } = await import('./commands/doctor.js');
    await doctorCommand(options);
  });

// onboard command - 初回セットアップウィザード
program
  .command('onboard')
  .description('初回セットアップウィザード')
  .option('--json', 'JSON形式で出力')
  .action(async (options: any) => {
    const { onboardCommand } = await import('./commands/onboard.js');
    await onboardCommand(options);
  });

// デフォルト動作（引数なし） - インタラクティブモード
program
  .action(async () => {
    // Claude Code環境では引数なしの場合にヘルプを表示
    if (isClaudeCodeEnvironment()) {
      console.log(chalk.cyan.bold('\n✨ Miyabi AX\n'));
      console.log(chalk.gray('ローカル完結型自律開発フレームワーク\n'));
      console.log(chalk.yellow('💡 Claude Code環境が検出されました\n'));
      console.log(chalk.white('利用可能なコマンド:\n'));
      console.log(chalk.cyan('  npx miyabi-ax init <project-name>') + chalk.gray('  - 新規プロジェクト作成'));
      console.log(chalk.cyan('  npx miyabi-ax install') + chalk.gray('            - 既存プロジェクトに追加'));
      console.log(chalk.cyan('  npx miyabi-ax agent') + chalk.gray('              - Agent実行'));
      console.log(chalk.cyan('  npx miyabi-ax auto') + chalk.gray('               - 全自動モード (Water Spider)'));
      console.log(chalk.cyan('  npx miyabi-ax todos') + chalk.gray('              - TODOコメント自動検出'));
      console.log(chalk.cyan('  npx miyabi-ax status') + chalk.gray('             - ステータス確認'));
      console.log(chalk.cyan('  npx miyabi-ax config') + chalk.gray('             - 設定管理'));
      console.log(chalk.cyan('  npx miyabi-ax setup') + chalk.gray('              - セットアップガイド'));
      console.log(chalk.cyan('  npx miyabi-ax onboard') + chalk.gray('            - 初回セットアップウィザード'));
      console.log(chalk.cyan('  npx miyabi-ax doctor') + chalk.gray('             - ヘルスチェック・診断\n'));
      console.log(chalk.gray('詳細: npx miyabi-ax --help\n'));
      process.exit(0);
    }

    // 対話モード（通常のターミナル環境）
    if (!isInteractiveTerminal()) {
      console.log(chalk.yellow('⚠️  対話モードは対話型ターミナルでのみ利用可能です'));
      console.log(chalk.white('\nコマンドを直接指定してください: miyabi-ax --help\n'));
      process.exit(1);
    }

    console.log(chalk.cyan.bold('\n✨ Miyabi AX\n'));
    console.log(chalk.gray('一つのコマンドで全てが完結\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '何をしますか？',
        choices: [
          { name: '🌸 初めての方（初回セットアップ）', value: 'onboard' },
          { name: '🆕 新しいプロジェクトを作成', value: 'init' },
          { name: '📦 既存プロジェクトに追加', value: 'install' },
          { name: '📊 ステータス確認', value: 'status' },
          { name: '🩺 ヘルスチェック・診断', value: 'doctor' },
          { name: '⚙️  設定', value: 'config' },
          { name: '❌ 終了', value: 'exit' },
        ],
      },
    ]);

    if (action === 'exit') {
      console.log(chalk.gray('\n👋 またね！\n'));
      process.exit(0);
    }

    try {
      switch (action) {
        case 'onboard': {
          const { onboardCommand } = await import('./commands/onboard.js');
          await onboardCommand({});
          break;
        }

        case 'setup': {
          const { setupCommand } = await import('./commands/setup.js');
          await setupCommand({});
          break;
        }

        case 'init': {
          const { projectName, isPrivate } = await inquirer.prompt([
            {
              type: 'input',
              name: 'projectName',
              message: 'プロジェクト名:',
              default: 'my-project',
              validate: (input) => {
                if (!input) return 'プロジェクト名を入力してください';
                if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
                  return '英数字、ハイフン、アンダースコアのみ使用可能です';
                }
                return true;
              },
            },
            {
              type: 'confirm',
              name: 'isPrivate',
              message: 'プライベートリポジトリにしますか？',
              default: false,
            },
          ]);

          console.log(chalk.cyan.bold('\n🚀 セットアップ開始...\n'));
          const { initCommand } = await import('./commands/init.js');
          await initCommand(projectName, { private: isPrivate, skipInstall: false });
          break;
        }

        case 'install': {
          const { dryRun } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'dryRun',
              message: 'ドライラン（実際には変更しない）で確認しますか？',
              default: false,
            },
          ]);

          console.log(chalk.cyan.bold('\n🔍 プロジェクト解析中...\n'));
          const { installCommand } = await import('./commands/install.js');
          await installCommand({ dryRun });
          break;
        }

        case 'status': {
          const { watch } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'watch',
              message: 'ウォッチモード（10秒ごとに自動更新）を有効にしますか？',
              default: false,
            },
          ]);

          const { statusCommand } = await import('./commands/status.js');
          await statusCommand({ watch });
          break;
        }

        case 'config': {
          const { configCommand } = await import('./commands/config.js');
          await configCommand({});
          break;
        }

        case 'doctor': {
          const { verbose } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'verbose',
              message: '詳細な診断情報を表示しますか？',
              default: false,
            },
          ]);

          const { doctorCommand } = await import('./commands/doctor.js');
          await doctorCommand({ verbose });
          break;
        }
      }
    } catch (error) {
      console.log(chalk.red.bold('\n❌ エラーが発生しました\n'));

      if (error instanceof Error) {
        console.log(chalk.red(`原因: ${error.message}\n`));
      } else {
        console.log(chalk.gray('予期しないエラーが発生しました\n'));
      }

      process.exit(1);
    }
  });

program.parse(process.argv);
