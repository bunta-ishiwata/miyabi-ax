/**
 * TestAgent - テスト自動実行・自動修正ループ
 *
 * 役割:
 * - Playwright/Chrome DevTools MCP統合
 * - コンソールエラー自動検出
 * - エラー0まで自動修正ループ
 * - テストカバレッジ計測
 */

import { BaseAgent } from '../core/BaseAgent.js';
import type {
  AgentResult,
  TestResult,
  TestError,
  CodeGenResult
} from '../types/agent.js';

export class TestAgent extends BaseAgent {
  private readonly COVERAGE_THRESHOLD = 80;
  private readonly MAX_FIX_ITERATIONS = 5;

  constructor() {
    super({
      name: 'TestAgent',
      version: '1.0.0',
      description: 'テスト自動実行・自動修正ループAgent',
      capabilities: ['Playwright統合', 'DevTools統合', '自動修正ループ', 'カバレッジ計測']
    });
  }

  protected async run(input: CodeGenResult): Promise<Partial<AgentResult>> {
    this.log('info', 'テスト実行を開始');

    let iteration = 0;
    let testResult: TestResult | null = null;

    // エラー0まで自動修正ループ
    while (iteration < this.MAX_FIX_ITERATIONS) {
      iteration++;
      this.log('info', `修正イテレーション ${iteration}/${this.MAX_FIX_ITERATIONS}`);

      // テストを実行
      testResult = await this.runTests(input);

      // エラーが0かつカバレッジ達成で成功
      if (testResult.errors.length === 0 && testResult.coverage >= this.COVERAGE_THRESHOLD) {
        this.log('info', `テスト成功 (カバレッジ: ${testResult.coverage}%)`);
        break;
      }

      // まだエラーがある場合
      this.log('warn', `エラー ${testResult.errors.length}件検出、自動修正を試行`);

      // 自動修正を試行（CodeGenAgentへフィードバック）
      const fixed = await this.autoFix(testResult.errors, input);
      if (!fixed) {
        this.log('error', '自動修正失敗');
        break;
      }
    }

    if (!testResult) {
      throw new Error('テスト実行失敗');
    }

    return {
      data: testResult,
      metadata: {
        iterations: iteration,
        finalCoverage: testResult.coverage,
        finalErrors: testResult.errors.length
      }
    };
  }

  /**
   * テストを実行
   */
  private async runTests(codeGen: CodeGenResult): Promise<TestResult> {
    const errors: TestError[] = [];

    // ユニットテストを実行
    const unitTestErrors = await this.runUnitTests(codeGen);
    errors.push(...unitTestErrors);

    // E2Eテストを実行（Playwright MCP使用）
    const e2eErrors = await this.runE2ETests(codeGen);
    errors.push(...e2eErrors);

    // ブラウザコンソールエラーをチェック（Chrome DevTools MCP使用）
    const consoleErrors = await this.checkBrowserConsole(codeGen);
    errors.push(...consoleErrors);

    // カバレッジを計測
    const coverage = await this.measureCoverage(codeGen);

    return {
      passed: errors.length === 0 && coverage >= this.COVERAGE_THRESHOLD,
      coverage,
      errors,
      summary: `テスト: ${errors.length}件のエラー | カバレッジ: ${coverage}%`
    };
  }

  /**
   * ユニットテストを実行
   */
  private async runUnitTests(codeGen: CodeGenResult): Promise<TestError[]> {
    // TODO: Vitest統合
    // 現在はモック実装

    const errors: TestError[] = [];

    // テストファイルをチェック
    const testFiles = codeGen.files.filter(f => f.path.includes('.test.'));

    if (testFiles.length === 0) {
      errors.push({
        type: 'assertion',
        message: 'テストファイルが見つかりません'
      });
    }

    return errors;
  }

  /**
   * E2Eテストを実行（Playwright MCP）
   */
  private async runE2ETests(codeGen: CodeGenResult): Promise<TestError[]> {
    this.log('info', 'Playwright E2Eテスト実行');

    const errors: TestError[] = [];

    // Claude CodeにPlaywright MCP使用を指示
    this.log('info', `
================================================================================
🎭 Playwright MCP 実行指示
================================================================================

対象ファイル: ${codeGen.files.map(f => f.path).join(', ')}

実行してほしいこと:
1. Playwright MCPツールを使用してE2Eテストを実行
2. 以下のMCPツールを活用:
   - mcp__playwright__navigate: テストページに移動
   - mcp__playwright__screenshot: スクリーンショット取得
   - mcp__playwright__click: 要素のクリック
   - mcp__playwright__fill: フォーム入力

3. エラーが検出された場合、TestError形式で返してください

例: ボタンが見つからない場合
{
  type: 'e2e',
  message: 'Button #submit not found',
  file: 'app.spec.ts',
  line: 10
}

Claude Codeが実際にMCPツールを呼び出し、結果をここに返します。
================================================================================
    `);

    // NOTE: 実際の実行はClaude Code上で行われるため、
    // ここではモックエラーを返すか、Claude Codeからの結果を待つ
    // 現時点では空配列を返す（エラーなし）

    return errors;
  }

  /**
   * ブラウザコンソールエラーをチェック（Chrome DevTools MCP）
   */
  private async checkBrowserConsole(codeGen: CodeGenResult): Promise<TestError[]> {
    this.log('info', 'Chrome DevTools MCPでブラウザコンソールチェック');

    const errors: TestError[] = [];

    // Claude CodeにChrome DevTools MCP使用を指示
    this.log('info', `
================================================================================
🔧 Chrome DevTools MCP 実行指示
================================================================================

対象ファイル: ${codeGen.files.map(f => f.path).join(', ')}

実行してほしいこと:
1. Chrome DevTools MCPツールを使用してブラウザ診断を実行
2. 以下のMCPツールを活用:
   - mcp__chrome-devtools__getConsoleLogs: コンソールログ取得
   - mcp__chrome-devtools__getNetworkLogs: ネットワークログ取得
   - mcp__chrome-devtools__getPerformanceMetrics: パフォーマンス計測
   - mcp__puppeteer__console: Puppeteerでコンソール監視

3. 検出したエラーをTestError形式で返してください

チェック項目:
✓ JavaScriptコンソールエラー（Uncaught Error, ReferenceError等）
✓ ネットワークエラー（404, 500等）
✓ パフォーマンス警告（Long tasks, Large bundle等）
✓ セキュリティ警告（Mixed content, CSP violations等）

例: コンソールエラーが検出された場合
{
  type: 'console',
  message: 'Uncaught ReferenceError: foo is not defined',
  file: 'app.js',
  line: 42
}

期待結果: エラー 0件

Claude Codeが実際にMCPツールを呼び出し、結果をここに返します。
================================================================================
    `);

    // NOTE: 実際の実行はClaude Code上で行われるため、
    // ここではモックエラーを返すか、Claude Codeからの結果を待つ
    // 現時点では空配列を返す（エラーなし）

    return errors;
  }

  /**
   * カバレッジを計測
   */
  private async measureCoverage(codeGen: CodeGenResult): Promise<number> {
    // TODO: c8またはIstanbul統合
    // 現在はモック実装

    // 簡易的な推定: テストファイル数 / 総ファイル数 * 100
    const testFileCount = codeGen.files.filter(f => f.path.includes('.test.')).length;
    const sourceFileCount = codeGen.files.filter(f => !f.path.includes('.test.')).length;

    if (sourceFileCount === 0) return 0;

    const coverage = (testFileCount / sourceFileCount) * 100;
    return Math.min(100, Math.max(0, coverage));
  }

  /**
   * 自動修正を試行
   */
  private async autoFix(errors: TestError[], _codeGen: CodeGenResult): Promise<boolean> {
    // TODO: CodeGenAgentへフィードバック
    // エラー情報を基に自動修正を依頼

    this.log('info', `${errors.length}件のエラーに対して自動修正を試行`);

    for (const error of errors) {
      this.log('info', `修正試行: ${error.message}`);
      // TODO: 実際の修正ロジック
    }

    // 現在はモック実装（修正成功と仮定）
    return false; // 実装完了までfalse
  }

  // /**
  //  * MCPサーバーに接続（Playwright） - 将来的に使用予定
  //  */
  // private async connectPlaywrightMCP(): Promise<void> {
  //   // TODO: Playwright MCP接続
  //   this.log('info', 'Playwright MCP接続（未実装）');
  // }

  // /**
  //  * MCPサーバーに接続（Chrome DevTools） - 将来的に使用予定
  //  */
  // private async connectDevToolsMCP(): Promise<void> {
  //   // TODO: Chrome DevTools MCP接続
  //   this.log('info', 'Chrome DevTools MCP接続（未実装）');
  // }
}
