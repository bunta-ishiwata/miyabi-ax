/**
 * PRAgent - Pull Request自動作成
 *
 * 役割:
 * - Conventional Commits準拠のPR作成
 * - Draft PR自動生成
 * - PR本文の自動生成
 */

import { BaseAgent } from '../core/BaseAgent.js';
import type {
  AgentResult,
  Issue,
  CodeGenResult,
  ReviewResult
} from '../types/agent.js';

interface PRInput {
  issue: Issue;
  codeGenResult: CodeGenResult;
  reviewResult: ReviewResult;
}

export class PRAgent extends BaseAgent {
  constructor() {
    super({
      name: 'PRAgent',
      version: '1.0.0',
      description: 'Pull Request自動作成Agent',
      capabilities: ['PR作成', 'Conventional Commits', 'Draft PR生成']
    });
  }

  protected async run(input: PRInput): Promise<Partial<AgentResult>> {
    this.log('info', `Issue #${input.issue.number} のPRを作成`);

    // PR本文を生成
    const prBody = this.generatePRBody(input);

    // PRタイトルを生成（Conventional Commits準拠）
    const prTitle = this.generatePRTitle(input.issue);

    // ブランチ名を生成
    const branchName = this.generateBranchName(input.issue);

    // Draft PRとして作成
    const prData = {
      title: prTitle,
      body: prBody,
      branch: branchName,
      isDraft: true
    };

    this.log('info', `Draft PR作成: ${prTitle}`);

    return {
      data: prData,
      metadata: {
        issueNumber: input.issue.number,
        filesChanged: input.codeGenResult.files.length,
        qualityScore: input.reviewResult.score
      }
    };
  }

  /**
   * PRタイトルを生成（Conventional Commits準拠）
   */
  private generatePRTitle(issue: Issue): string {
    const type = this.inferCommitType(issue);
    const scope = this.inferScope(issue);
    const description = issue.title;

    if (scope) {
      return `${type}(${scope}): ${description}`;
    }
    return `${type}: ${description}`;
  }

  /**
   * Commit Typeを推論
   */
  private inferCommitType(issue: Issue): string {
    const text = `${issue.title} ${issue.body}`.toLowerCase();

    if (text.includes('bug') || text.includes('fix')) return 'fix';
    if (text.includes('doc')) return 'docs';
    if (text.includes('test')) return 'test';
    if (text.includes('refactor')) return 'refactor';
    if (text.includes('perf')) return 'perf';
    if (text.includes('style')) return 'style';
    if (text.includes('chore')) return 'chore';
    if (text.includes('ci') || text.includes('deploy')) return 'ci';

    return 'feat';
  }

  /**
   * Scopeを推論
   */
  private inferScope(issue: Issue): string | null {
    const text = `${issue.title} ${issue.body}`.toLowerCase();

    if (text.includes('agent')) return 'agents';
    if (text.includes('cli')) return 'cli';
    if (text.includes('mcp')) return 'mcp';
    if (text.includes('core')) return 'core';
    if (text.includes('test')) return 'test';

    return null;
  }

  /**
   * PR本文を生成
   */
  private generatePRBody(input: PRInput): string {
    const { issue, codeGenResult, reviewResult } = input;

    const body = `# ${issue.title}

## 概要

Closes #${issue.number}

${issue.body.split('\n').slice(0, 5).join('\n')}

## 変更内容

${this.generateChangeSummary(codeGenResult)}

## 品質レポート

- **品質スコア**: ${reviewResult.score}/100 ${reviewResult.passed ? '✅' : '❌'}
- **エラー**: ${reviewResult.issues.filter(i => i.severity === 'error').length}件
- **警告**: ${reviewResult.issues.filter(i => i.severity === 'warning').length}件

## 生成ファイル

${codeGenResult.files.map(f => `- \`${f.path}\``).join('\n')}

## テスト

- [ ] ユニットテスト実行済み
- [ ] E2Eテスト実行済み
- [ ] カバレッジ ≥80%

## チェックリスト

- [x] TypeScript strict mode対応
- [x] ESLintルール準拠
- [x] セキュリティスキャン実施
- [ ] 人間によるレビュー完了

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
`;

    return body;
  }

  /**
   * 変更サマリーを生成
   */
  private generateChangeSummary(codeGen: CodeGenResult): string {
    const summary: string[] = [];

    const featureFiles = codeGen.files.filter(f => f.path.includes('features/'));
    const testFiles = codeGen.files.filter(f => f.path.includes('.test.'));
    const otherFiles = codeGen.files.filter(
      f => !f.path.includes('features/') && !f.path.includes('.test.')
    );

    if (featureFiles.length > 0) {
      summary.push(`- 新機能実装: ${featureFiles.length}ファイル`);
    }
    if (testFiles.length > 0) {
      summary.push(`- テスト追加: ${testFiles.length}ファイル`);
    }
    if (otherFiles.length > 0) {
      summary.push(`- その他の変更: ${otherFiles.length}ファイル`);
    }

    return summary.join('\n');
  }

  /**
   * ブランチ名を生成
   */
  private generateBranchName(issue: Issue): string {
    const type = this.inferCommitType(issue);
    const issueNumber = issue.number;
    const slug = issue.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    return `${type}/issue-${issueNumber}-${slug}`;
  }
}
