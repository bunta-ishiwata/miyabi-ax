/**
 * ErrorFeedbackLoop - エラー自動修正フィードバックループ
 *
 * 役割:
 * - TestAgentで検出されたエラーをCodeGenAgentにフィードバック
 * - エラー0まで自動修正を繰り返す
 * - エラー情報の構造化・優先順位付け
 */

import { CodeGenAgent } from '../agents/CodeGenAgent.js';
import type { TestError, CodeGenResult, Task } from '../types/agent.js';

export interface ErrorFeedback {
  errors: TestError[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  fixSuggestion: string;
  affectedFiles: string[];
}

export class ErrorFeedbackLoop {
  private codeGenAgent: CodeGenAgent;

  constructor() {
    this.codeGenAgent = new CodeGenAgent();
  }

  /**
   * エラーを分析してフィードバックを生成
   */
  async analyzeErrors(errors: TestError[]): Promise<ErrorFeedback> {
    // エラーを優先順位付け
    const criticalErrors = errors.filter(e => e.type === 'runtime' || e.type === 'assertion');
    const consoleErrors = errors.filter(e => e.type === 'console');

    const priority = criticalErrors.length > 0 ? 'critical' :
                     consoleErrors.length > 0 ? 'high' : 'medium';

    // 影響を受けるファイルを特定
    const affectedFiles = [...new Set(errors.filter(e => e.file).map(e => e.file!))];

    // 修正提案を生成
    const fixSuggestion = this.generateFixSuggestion(errors);

    return {
      errors,
      priority,
      fixSuggestion,
      affectedFiles
    };
  }

  /**
   * 修正提案を生成
   */
  private generateFixSuggestion(errors: TestError[]): string {
    const suggestions: string[] = [];

    for (const error of errors) {
      switch (error.type) {
        case 'console':
          suggestions.push(this.suggestConsoleErrorFix(error));
          break;
        case 'runtime':
          suggestions.push(this.suggestRuntimeErrorFix(error));
          break;
        case 'assertion':
          suggestions.push(this.suggestAssertionErrorFix(error));
          break;
      }
    }

    return suggestions.join('\n\n');
  }

  /**
   * コンソールエラーの修正提案
   */
  private suggestConsoleErrorFix(error: TestError): string {
    const message = error.message;

    // よくあるエラーパターンに対する修正提案
    if (message.includes('is not defined')) {
      const varName = message.match(/'?(\w+)'? is not defined/)?.[1];
      return `変数 '${varName}' が未定義です。以下を確認してください:
- インポート漏れ: import ${varName} from '...'
- スコープ外参照: ${varName}が定義されているスコープを確認
- タイポ: 変数名のスペルミス`;
    }

    if (message.includes('Cannot read property') || message.includes('Cannot read properties')) {
      return `Nullチェック不足です。以下の対策を実装してください:
- Optional chaining: obj?.property
- Null check: if (obj && obj.property)
- デフォルト値: const value = obj?.property ?? 'default'`;
    }

    if (message.includes('is not a function')) {
      return `関数呼び出しエラーです。以下を確認してください:
- 型の確認: 変数が実際に関数かどうか
- インポート: 正しい関数をインポートしているか
- this binding: アロー関数またはbindを使用`;
    }

    return `コンソールエラー: ${message}\n修正が必要です。`;
  }

  /**
   * ランタイムエラーの修正提案
   */
  private suggestRuntimeErrorFix(error: TestError): string {
    return `ランタイムエラー: ${error.message}
ファイル: ${error.file || '不明'}
行: ${error.line || '不明'}

以下を確認してください:
- try-catchでエラーハンドリング
- エラー発生箇所の特定と修正
- テストケースの追加`;
  }

  /**
   * アサーションエラーの修正提案
   */
  private suggestAssertionErrorFix(error: TestError): string {
    return `テストアサーションエラー: ${error.message}

以下を確認してください:
- 期待値と実際の値の確認
- テストロジックの見直し
- 実装コードの修正`;
  }

  /**
   * エラーフィードバックに基づいてコード修正
   */
  async fixErrors(
    feedback: ErrorFeedback,
    originalCodeGen: CodeGenResult
  ): Promise<CodeGenResult> {
    console.log('\n🔧 エラー自動修正を開始');
    console.log(`優先度: ${feedback.priority}`);
    console.log(`影響ファイル: ${feedback.affectedFiles.join(', ')}`);
    console.log(`\n修正提案:\n${feedback.fixSuggestion}\n`);

    // 修正タスクを作成
    const fixTask: Task = {
      id: 'auto-fix-task',
      title: 'エラー自動修正',
      description: `以下のエラーを修正してください:\n\n${feedback.fixSuggestion}`,
      type: 'bug',
      priority: feedback.priority === 'critical' ? 'P0-Critical' : 'P1-High',
      status: 'implementing',
      dependencies: [],
      complexity: 'medium'
    };

    // CodeGenAgentで修正コードを生成
    const fixResult = await this.codeGenAgent.execute(fixTask);

    if (!fixResult.success || !fixResult.data) {
      throw new Error(`自動修正失敗: ${fixResult.error}`);
    }

    const fixedCodeGen = fixResult.data as CodeGenResult;

    // 元のファイルと修正ファイルをマージ
    const mergedFiles = this.mergeCodeGenResults(originalCodeGen, fixedCodeGen);

    return {
      files: mergedFiles,
      summary: `エラー修正: ${feedback.errors.length}件のエラーに対応`,
      qualityScore: fixedCodeGen.qualityScore
    };
  }

  /**
   * CodeGenResultをマージ
   */
  private mergeCodeGenResults(original: CodeGenResult, fixed: CodeGenResult) {
    const fileMap = new Map(original.files.map(f => [f.path, f]));

    // 修正ファイルで上書き
    for (const fixedFile of fixed.files) {
      fileMap.set(fixedFile.path, fixedFile);
    }

    return Array.from(fileMap.values());
  }
}
