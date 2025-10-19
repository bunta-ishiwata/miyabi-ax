#!/usr/bin/env node

/**
 * MIYABI AX - CLI Tool
 * 元のmiyabiと同じコマンド構造
 */

import { Command } from 'commander';
import { VERSION } from '../index.js';

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

// デフォルト動作（引数なし）
if (process.argv.length === 2) {
  // 引数なしの場合はヘルプを表示
  program.help();
}

program.parse(process.argv);
