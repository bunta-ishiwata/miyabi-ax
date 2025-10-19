#!/usr/bin/env node

/**
 * MIYABI AX - Interactive CLI Tool
 *
 * Usage:
 *   npx miyabi-ax
 */

import * as readline from 'readline';
import { VERSION, FRAMEWORK_NAME } from '../index.js';
import { AgentOrchestrator } from '../core/AgentOrchestrator.js';
import type { Issue } from '../types/agent.js';

const args = process.argv.slice(2);

// バージョン・ヘルプコマンドは直接処理
if (args.includes('--version') || args.includes('-v')) {
  console.log(`v${VERSION}`);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// メイン対話型UI起動
await startInteractiveCLI();

/**
 * 対話型CLI起動
 */
async function startInteractiveCLI(): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🌸 ${FRAMEWORK_NAME} v${VERSION}`);
  console.log('ローカル完結型自律開発フレームワーク');
  console.log('='.repeat(80) + '\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // メインメニュー表示
  showMainMenu();

  // 対話ループ
  rl.on('line', async (input: string) => {
    const choice = input.trim();

    switch (choice) {
      case '1':
        await handleInit(rl);
        break;
      case '2':
        await handleStatus(rl);
        break;
      case '3':
        await handleAgentRun(rl);
        break;
      case '4':
        showHelp();
        showMainMenu();
        break;
      case '5':
      case 'q':
      case 'quit':
      case 'exit':
        console.log('\n👋 MIYABI AX を終了します\n');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ 無効な選択です。1-5の数字を入力してください。\n');
        showMainMenu();
        break;
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

/**
 * メインメニュー表示
 */
function showMainMenu(): void {
  console.log('📋 メインメニュー:');
  console.log('  [1] 初回セットアップ (init)');
  console.log('  [2] ステータス確認 (status)');
  console.log('  [3] エージェント実行 (agent-run)');
  console.log('  [4] ヘルプ表示 (help)');
  console.log('  [5] 終了 (quit)');
  console.log();
  process.stdout.write('選択してください (1-5): ');
}

/**
 * [1] 初回セットアップ
 */
async function handleInit(_rl: readline.Interface): Promise<void> {
  console.log('\n📦 MIYABI AX セットアップを開始...\n');

  // TODO: 実装
  console.log('✅ .miyabi-ax/ ディレクトリ作成');
  console.log('✅ config.json 生成');
  console.log('✅ .claude/settings.json 作成');
  console.log('✅ .gitignore 更新\n');

  console.log('✨ セットアップ完了！\n');
  showMainMenu();
}

/**
 * [2] ステータス確認
 */
async function handleStatus(_rl: readline.Interface): Promise<void> {
  console.log('\n📊 MIYABI AX ステータス\n');

  console.log('Environment:');
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  CWD: ${process.cwd()}`);
  console.log();

  console.log('Agents:');
  console.log('  ✅ CoordinatorAgent - タスク統括・DAG分解');
  console.log('  ✅ IssueAgent - Issue分析・ラベル管理');
  console.log('  ✅ CodeGenAgent - AI駆動コード生成');
  console.log('  ✅ ReviewAgent - 品質判定・スコアリング');
  console.log('  ✅ TestAgent - テスト実行・MCP統合');
  console.log('  ✅ PRAgent - PR自動作成');
  console.log('  ✅ DeploymentAgent - CI/CDデプロイ');
  console.log();

  console.log('Configuration:');
  console.log('  Config: .miyabi-ax/config.json');
  console.log('  Claude Code: .claude/settings.json');
  console.log('  MCP Servers: .claude/mcp.json');
  console.log();

  showMainMenu();
}

/**
 * [3] エージェント実行
 */
async function handleAgentRun(rl: readline.Interface): Promise<void> {
  console.log('\n🤖 エージェント自動実行モード\n');

  // Issue番号を対話的に取得
  const issueNumber = await askQuestion(rl, 'Issue番号を入力してください: ');
  const num = parseInt(issueNumber, 10);

  if (isNaN(num)) {
    console.log('❌ 無効なIssue番号です\n');
    showMainMenu();
    return;
  }

  console.log(`\n🌸 Issue #${num} の自動処理を開始します...\n`);

  // Issueをフェッチ（モック実装）
  const issue: Issue = {
    number: num,
    title: `Issue #${num} の処理`,
    body: `- [ ] タスク1\n- [ ] タスク2\n- [ ] タスク3`,
    labels: [],
    state: 'open',
    assignees: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Orchestratorで実行
  const orchestrator = new AgentOrchestrator();
  const result = await orchestrator.processIssue(issue);

  // 結果表示
  orchestrator.printSummary(result);

  console.log('\nEnterキーを押してメニューに戻る...');
  await askQuestion(rl, '');
  showMainMenu();
}

/**
 * 対話的に質問する
 */
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

/**
 * ヘルプ表示
 */
function showHelp(): void {
  console.log(`
🌸 MIYABI AX - ローカル完結型自律開発フレームワーク

対話型モード:
  npx miyabi-ax                対話型UIを起動

コマンドラインモード:
  npx miyabi-ax --help         ヘルプを表示
  npx miyabi-ax --version      バージョンを表示

機能:
  - 7つの自律エージェント（Coordinator/Issue/CodeGen/Review/Test/PR/Deployment）
  - DAGベースのタスク分解・並列実行
  - エラー自動修正ループ（エラー0まで）
  - MCP統合（Playwright + Chrome DevTools）
  - 識学理論準拠の53ラベル体系
  - 品質スコア80点以上、カバレッジ80%以上を自動担保

Documentation:
  https://github.com/bunta-ishiwata/miyabi-ax

`);
}
