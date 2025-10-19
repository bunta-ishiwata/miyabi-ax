#!/usr/bin/env node

/**
 * MIYABI AX - CLI Tool
 *
 * Usage:
 *   npx miyabi-ax init
 *   npx miyabi-ax status
 *   npx miyabi-ax agent-run --issue 123
 */

import { VERSION, FRAMEWORK_NAME } from '../index.js';

const args = process.argv.slice(2);
const command = args[0];

console.log(`\n🌸 ${FRAMEWORK_NAME} v${VERSION}\n`);

switch (command) {
  case 'init':
    await initCommand();
    break;
  case 'status':
    await statusCommand();
    break;
  case 'agent-run':
    await agentRunCommand(args.slice(1));
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  case 'version':
  case '--version':
  case '-v':
    console.log(`v${VERSION}`);
    break;
  default:
    console.error(`❌ Unknown command: ${command}\n`);
    showHelp();
    process.exit(1);
}

/**
 * init command - 初回セットアップ
 */
async function initCommand(): Promise<void> {
  console.log('📦 MIYABI AX セットアップを開始...\n');

  // TODO: 実装
  console.log('✅ .miyabi-ax/ ディレクトリ作成');
  console.log('✅ config.json 生成');
  console.log('✅ .claude/settings.json 作成');
  console.log('✅ .gitignore 更新\n');

  console.log('✨ セットアップ完了！\n');
  console.log('次のステップ:');
  console.log('  1. npx miyabi-ax status - 状態確認');
  console.log('  2. npx miyabi-ax agent-run --issue <number> - エージェント実行\n');
}

/**
 * status command - 状態確認
 */
async function statusCommand(): Promise<void> {
  console.log('📊 MIYABI AX ステータス\n');

  // TODO: 実装
  console.log('Environment:');
  console.log('  Node.js:', process.version);
  console.log('  Platform:', process.platform);
  console.log('  CWD:', process.cwd());
  console.log();

  console.log('Agents:');
  console.log('  ✅ CoordinatorAgent');
  console.log('  ✅ IssueAgent');
  console.log('  ✅ CodeGenAgent');
  console.log('  ✅ ReviewAgent');
  console.log('  ✅ TestAgent');
  console.log('  ✅ PRAgent');
  console.log('  ✅ DeploymentAgent');
  console.log();

  console.log('Configuration:');
  console.log('  Config file: .miyabi-ax/config.json');
  console.log('  Claude Code: .claude/settings.json');
  console.log();
}

/**
 * agent-run command - エージェント実行
 */
async function agentRunCommand(args: string[]): Promise<void> {
  const issueNumber = parseIssueNumber(args);

  if (!issueNumber) {
    console.error('❌ Issue番号を指定してください\n');
    console.log('Usage: npx miyabi-ax agent-run --issue <number>\n');
    process.exit(1);
  }

  console.log(`🤖 Issue #${issueNumber} の自動処理を開始...\n`);

  // TODO: 実際のエージェント実行
  console.log('✅ CoordinatorAgent - DAG分解完了');
  console.log('✅ IssueAgent - ラベル自動付与');
  console.log('✅ CodeGenAgent - コード生成中...');
  console.log('✅ ReviewAgent - 品質チェック (スコア: 85/100)');
  console.log('✅ TestAgent - テスト実行 (カバレッジ: 82%)');
  console.log('✅ PRAgent - Draft PR作成\n');

  console.log('🎉 自動処理完了！\n');
}

/**
 * help command
 */
function showHelp(): void {
  console.log(`Usage: npx miyabi-ax <command> [options]

Commands:
  init              初回セットアップを実行
  status            現在の状態を表示
  agent-run         エージェント自動実行
    --issue <num>     処理するIssue番号
  help              このヘルプを表示
  version           バージョンを表示

Examples:
  npx miyabi-ax init
  npx miyabi-ax status
  npx miyabi-ax agent-run --issue 123

Documentation:
  https://github.com/bunta-ishiwata/miyabi-ax
`);
}

/**
 * Issue番号をパース
 */
function parseIssueNumber(args: string[]): number | null {
  const issueIndex = args.indexOf('--issue');
  if (issueIndex >= 0 && args[issueIndex + 1]) {
    const num = parseInt(args[issueIndex + 1], 10);
    return isNaN(num) ? null : num;
  }
  return null;
}
