/**
 * ReviewAgent - コード品質判定
 *
 * 役割:
 * - 静的解析（TypeScript, ESLint）
 * - セキュリティスキャン
 * - 品質スコアリング（100点満点、80点以上で合格）
 */

import { BaseAgent } from '../core/BaseAgent.js';
import type {
  AgentResult,
  CodeGenResult,
  ReviewResult,
  ReviewIssue
} from '../types/agent.js';

export class ReviewAgent extends BaseAgent {
  private readonly PASS_THRESHOLD = 80;

  constructor() {
    super({
      name: 'ReviewAgent',
      version: '1.0.0',
      description: 'コード品質判定Agent',
      capabilities: ['静的解析', 'セキュリティスキャン', '品質スコアリング']
    });
  }

  protected async run(input: CodeGenResult): Promise<Partial<AgentResult>> {
    this.log('info', '品質レビューを開始');

    // 静的解析を実行
    const issues = await this.runStaticAnalysis(input);

    // セキュリティスキャン
    const securityIssues = await this.runSecurityScan(input);

    // すべての問題を統合
    const allIssues = [...issues, ...securityIssues];

    // スコアを計算
    const score = this.calculateScore(allIssues, input.files.length);
    const passed = score >= this.PASS_THRESHOLD;

    this.log('info', `品質スコア: ${score}/100 (${passed ? '合格' : '不合格'})`);

    const result: ReviewResult = {
      score,
      passed,
      issues: allIssues,
      summary: this.generateSummary(score, allIssues)
    };

    return {
      data: result,
      metadata: {
        totalIssues: allIssues.length,
        errorCount: allIssues.filter(i => i.severity === 'error').length,
        warningCount: allIssues.filter(i => i.severity === 'warning').length
      }
    };
  }

  /**
   * 静的解析を実行
   */
  private async runStaticAnalysis(codeGen: CodeGenResult): Promise<ReviewIssue[]> {
    const issues: ReviewIssue[] = [];

    for (const file of codeGen.files) {
      // TypeScriptエラーをチェック
      const tsIssues = this.checkTypeScript(file);
      issues.push(...tsIssues);

      // ESLintルールをチェック
      const lintIssues = this.checkLinting(file);
      issues.push(...lintIssues);

      // コーディング規約をチェック
      const styleIssues = this.checkCodingStyle(file);
      issues.push(...styleIssues);
    }

    return issues;
  }

  /**
   * TypeScriptチェック（簡易実装）
   */
  private checkTypeScript(file: { path: string; content: string }): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    // TODO: 実際のTypeScriptコンパイラ統合
    // 現在は簡易的なパターンマッチング

    // any型の使用をチェック
    if (file.content.includes(': any')) {
      issues.push({
        file: file.path,
        line: 0,
        severity: 'warning',
        message: 'any型の使用を避けてください',
        rule: 'no-explicit-any'
      });
    }

    // console.logの使用をチェック
    if (file.content.includes('console.log')) {
      issues.push({
        file: file.path,
        line: 0,
        severity: 'warning',
        message: 'console.logは本番環境では削除してください',
        rule: 'no-console'
      });
    }

    return issues;
  }

  /**
   * Lintingチェック
   */
  private checkLinting(file: { path: string; content: string }): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    // TODO: ESLint統合

    // 長すぎる関数をチェック
    const lines = file.content.split('\n');
    if (lines.length > 200) {
      issues.push({
        file: file.path,
        line: 0,
        severity: 'warning',
        message: 'ファイルが長すぎます（200行超）',
        rule: 'max-lines'
      });
    }

    return issues;
  }

  /**
   * コーディングスタイルチェック
   */
  private checkCodingStyle(_file: { path: string; content: string }): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    // TODO: Prettierなどのフォーマッター統合

    return issues;
  }

  /**
   * セキュリティスキャン
   */
  private async runSecurityScan(codeGen: CodeGenResult): Promise<ReviewIssue[]> {
    const issues: ReviewIssue[] = [];

    for (const file of codeGen.files) {
      // ハードコードされたシークレットをチェック
      const secretIssues = this.checkHardcodedSecrets(file);
      issues.push(...secretIssues);

      // SQLインジェクションをチェック
      const sqlIssues = this.checkSQLInjection(file);
      issues.push(...sqlIssues);
    }

    return issues;
  }

  /**
   * ハードコードされたシークレットをチェック
   */
  private checkHardcodedSecrets(file: { path: string; content: string }): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    // APIキーパターン
    const patterns = [
      /api[_-]?key\s*=\s*["'][^"']+["']/i,
      /secret\s*=\s*["'][^"']+["']/i,
      /password\s*=\s*["'][^"']+["']/i,
      /token\s*=\s*["'][^"']+["']/i
    ];

    for (const pattern of patterns) {
      if (pattern.test(file.content)) {
        issues.push({
          file: file.path,
          line: 0,
          severity: 'error',
          message: 'ハードコードされたシークレットが検出されました',
          rule: 'no-hardcoded-secrets'
        });
      }
    }

    return issues;
  }

  /**
   * SQLインジェクションをチェック
   */
  private checkSQLInjection(file: { path: string; content: string }): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    // 文字列連結によるSQL構築をチェック
    if (/SELECT.*\+/.test(file.content)) {
      issues.push({
        file: file.path,
        line: 0,
        severity: 'error',
        message: 'SQLインジェクションの可能性があります（パラメータ化クエリを使用してください）',
        rule: 'no-sql-injection'
      });
    }

    return issues;
  }

  /**
   * 品質スコアを計算
   */
  private calculateScore(issues: ReviewIssue[], fileCount: number): number {
    let score = 100;

    // エラーごとに減点
    const errorCount = issues.filter(i => i.severity === 'error').length;
    score -= errorCount * 10;

    // 警告ごとに減点
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    score -= warningCount * 2;

    // ファイル数による調整
    if (fileCount === 0) score = 0;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * サマリーを生成
   */
  private generateSummary(score: number, issues: ReviewIssue[]): string {
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    return `品質スコア: ${score}/100 | エラー: ${errorCount}件 | 警告: ${warningCount}件`;
  }
}
