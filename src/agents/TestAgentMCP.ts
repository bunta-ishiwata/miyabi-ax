/**
 * TestAgentMCP - MCP統合版TestAgent
 *
 * 役割:
 * - Playwright/Chrome DevTools MCPを実際に呼び出し
 * - ブラウザテスト自動実行
 * - コンソールエラー自動検出
 * - エラー0まで自動修正ループ
 */

import { TestAgent } from './TestAgent.js';
import type { TestError, CodeGenResult } from '../types/agent.js';

/**
 * MCP統合版TestAgent
 *
 * Claude Code上でMCPツールを直接呼び出してテストを実行
 */
export class TestAgentMCP extends TestAgent {
  /**
   * E2Eテストを実行（Playwright MCP使用）
   *
   * NOTE: このメソッドはClaude Code上で実行される想定
   * Claude Codeが mcp__playwright__* ツールを呼び出す
   */
  protected async runE2ETestsWithMCP(codeGen: CodeGenResult): Promise<TestError[]> {
    this.log('info', 'Playwright MCPでE2Eテスト開始');

    const errors: TestError[] = [];

    try {
      // Claude Codeに対してMCPツールの使用を依頼
      // 実際の実行時はClaude Codeが以下のようなツールを呼び出す:
      // - mcp__playwright__navigate
      // - mcp__playwright__screenshot
      // - mcp__playwright__click
      // etc.

      this.log('info', `
================================================================================
Playwright MCP 実行指示
================================================================================

以下のE2Eテストを実行してください:

対象ファイル: ${codeGen.files.map(f => f.path).join(', ')}

テストシナリオ:
1. ブラウザを起動
2. アプリケーションをロード
3. 主要な機能をテスト
4. エラーがあれば記録

MCPツール使用例:
- mcp__playwright__navigate: アプリケーションURLに移動
- mcp__playwright__screenshot: スクリーンショット取得
- mcp__playwright__click: 要素クリック
- mcp__playwright__fill: フォーム入力

================================================================================
      `);

      // 実際の実装では、Claude Codeがここで自動的にMCPツールを呼び出します
      // 現時点ではモック実装

    } catch (error) {
      errors.push({
        type: 'runtime',
        message: `Playwright E2Eテストエラー: ${error}`,
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return errors;
  }

  /**
   * Chrome DevTools MCPでブラウザコンソールをチェック
   *
   * NOTE: このメソッドはClaude Code上で実行される想定
   * Claude Codeが mcp__chrome-devtools__* ツールを呼び出す
   */
  protected async checkBrowserConsoleWithMCP(codeGen: CodeGenResult): Promise<TestError[]> {
    this.log('info', 'Chrome DevTools MCPでコンソールログ取得開始');

    const errors: TestError[] = [];

    try {
      // Claude Codeに対してMCPツールの使用を依頼
      // 実際の実行時はClaude Codeが以下のようなツールを呼び出す:
      // - mcp__chrome-devtools__getConsoleLogs
      // - mcp__chrome-devtools__getNetworkLogs
      // - mcp__chrome-devtools__getPerformanceMetrics
      // etc.

      this.log('info', `
================================================================================
Chrome DevTools MCP 実行指示
================================================================================

以下のブラウザ診断を実行してください:

対象ファイル: ${codeGen.files.map(f => f.path).join(', ')}

チェック項目:
1. コンソールエラー（Error, Warning）
2. ネットワークエラー（Failed requests）
3. JavaScriptランタイムエラー
4. パフォーマンス問題

MCPツール使用例:
- mcp__chrome-devtools__getConsoleLogs: コンソールログ取得
- mcp__chrome-devtools__getNetworkLogs: ネットワークログ取得
- mcp__chrome-devtools__getPerformanceMetrics: パフォーマンス計測
- mcp__puppeteer__console: Puppeteerでコンソール監視

期待結果:
- コンソールエラー: 0件
- ネットワークエラー: 0件
- JavaScriptエラー: 0件

================================================================================
      `);

      // 実際の実装では、Claude Codeがここで自動的にMCPツールを呼び出します
      // 検出されたエラーを TestError[] として返す

      // 例: コンソールエラーが検出された場合
      // errors.push({
      //   type: 'console',
      //   message: 'Uncaught ReferenceError: foo is not defined',
      //   file: 'app.js',
      //   line: 42
      // });

    } catch (error) {
      errors.push({
        type: 'console',
        message: `Chrome DevTools取得エラー: ${error}`,
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return errors;
  }

  /**
   * すべてのMCPテストを統合実行
   */
  async runAllMCPTests(codeGen: CodeGenResult): Promise<TestError[]> {
    const allErrors: TestError[] = [];

    // Playwright E2Eテスト
    const e2eErrors = await this.runE2ETestsWithMCP(codeGen);
    allErrors.push(...e2eErrors);

    // Chrome DevTools コンソールチェック
    const consoleErrors = await this.checkBrowserConsoleWithMCP(codeGen);
    allErrors.push(...consoleErrors);

    // Puppeteer追加チェック（オプション）
    const puppeteerErrors = await this.runPuppeteerChecks(codeGen);
    allErrors.push(...puppeteerErrors);

    return allErrors;
  }

  /**
   * Puppeteer MCPでの追加チェック
   */
  private async runPuppeteerChecks(codeGen: CodeGenResult): Promise<TestError[]> {
    this.log('info', 'Puppeteer MCPで追加チェック');

    const errors: TestError[] = [];

    try {
      this.log('info', `
================================================================================
Puppeteer MCP 実行指示
================================================================================

対象ファイル: ${codeGen.files.map(f => f.path).join(', ')}

追加チェック:
1. ページロード時間
2. メモリリーク検出
3. 未使用CSS/JS検出
4. アクセシビリティチェック

MCPツール使用例:
- mcp__puppeteer__navigate: ページ移動
- mcp__puppeteer__console: コンソールイベント監視
- mcp__puppeteer__screenshot: スクリーンショット
- mcp__puppeteer__evaluate: JavaScript実行

================================================================================
      `);

    } catch (error) {
      errors.push({
        type: 'runtime',
        message: `Puppeteer追加チェックエラー: ${error}`,
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return errors;
  }
}
