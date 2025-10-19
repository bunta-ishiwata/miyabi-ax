/**
 * IssueAgent - Issue分析・ラベル管理
 *
 * 役割:
 * - 識学理論53ラベル体系による自動分類
 * - タスク複雑度推定
 * - 優先度判定
 */

import { BaseAgent } from '../core/BaseAgent.js';
import type { AgentResult, Issue } from '../types/agent.js';

export class IssueAgent extends BaseAgent {
  // ラベルカテゴリ（将来的に使用予定）
  // private readonly LABEL_CATEGORIES = {
  //   type: ['bug', 'feature', 'refactor', 'docs', 'test', 'chore', 'security'],
  //   priority: ['P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low'],
  //   complexity: ['small', 'medium', 'large', 'xlarge'],
  //   phase: ['planning', 'design', 'implementation', 'testing', 'deployment'],
  //   category: ['frontend', 'backend', 'infra', 'dx', 'security']
  // };

  constructor() {
    super({
      name: 'IssueAgent',
      version: '1.0.0',
      description: 'Issue分析・ラベル管理Agent',
      capabilities: ['Issue分析', 'ラベル自動付与', '複雑度推定', '優先度判定']
    });
  }

  protected async run(input: Issue): Promise<Partial<AgentResult>> {
    this.log('info', `Issue #${input.number} の分析を開始`);

    // ラベルを分析・推論
    const suggestedLabels = await this.analyzeAndSuggestLabels(input);
    this.log('info', `${suggestedLabels.length}個のラベルを推奨`);

    // 複雑度を推定
    const complexity = this.estimateComplexity(input);

    // 優先度を推定
    const priority = this.estimatePriority(input);

    return {
      data: {
        suggestedLabels,
        complexity,
        priority
      },
      metadata: {
        originalLabels: input.labels,
        addedLabels: suggestedLabels.filter(l => !input.labels.includes(l))
      }
    };
  }

  /**
   * ラベルを分析・推奨
   */
  private async analyzeAndSuggestLabels(issue: Issue): Promise<string[]> {
    const labels = new Set(issue.labels);

    // タイプラベル
    const type = this.inferType(issue);
    labels.add(`type:${type}`);

    // 優先度ラベル
    const priority = this.estimatePriority(issue);
    labels.add(`priority:${priority}`);

    // 複雑度ラベル
    const complexity = this.estimateComplexity(issue);
    labels.add(`complexity:${complexity}`);

    // カテゴリラベル
    const category = this.inferCategory(issue);
    labels.add(`category:${category}`);

    // フェーズラベル
    labels.add('phase:planning');

    return Array.from(labels);
  }

  /**
   * タイプを推論
   */
  private inferType(issue: Issue): string {
    const text = `${issue.title} ${issue.body}`.toLowerCase();

    if (text.includes('bug') || text.includes('fix') || text.includes('修正')) return 'bug';
    if (text.includes('security') || text.includes('脆弱性')) return 'security';
    if (text.includes('test') || text.includes('テスト')) return 'test';
    if (text.includes('doc') || text.includes('ドキュメント')) return 'docs';
    if (text.includes('refactor') || text.includes('リファクタ')) return 'refactor';
    if (text.includes('feature') || text.includes('機能')) return 'feature';

    return 'feature';
  }

  /**
   * 優先度を推定
   */
  private estimatePriority(issue: Issue): string {
    const text = `${issue.title} ${issue.body}`.toLowerCase();

    if (text.includes('critical') || text.includes('緊急') || text.includes('障害')) {
      return 'P0-Critical';
    }
    if (text.includes('high') || text.includes('重要') || text.includes('優先')) {
      return 'P1-High';
    }
    if (text.includes('low') || text.includes('低優先度')) {
      return 'P3-Low';
    }

    return 'P2-Medium';
  }

  /**
   * 複雑度を推定
   */
  private estimateComplexity(issue: Issue): string {
    const text = `${issue.title} ${issue.body}`.toLowerCase();
    const bodyLength = issue.body.length;
    const checkboxCount = (issue.body.match(/- \[ \]/g) || []).length;

    // 大規模キーワード
    if (
      text.includes('大規模') ||
      text.includes('フレームワーク') ||
      text.includes('アーキテクチャ') ||
      checkboxCount > 10
    ) {
      return 'xlarge';
    }

    // 中〜大規模
    if (
      text.includes('実装') ||
      text.includes('統合') ||
      text.includes('システム') ||
      checkboxCount > 5 ||
      bodyLength > 1000
    ) {
      return 'large';
    }

    // 中規模
    if (checkboxCount > 2 || bodyLength > 500) {
      return 'medium';
    }

    return 'small';
  }

  /**
   * カテゴリを推論
   */
  private inferCategory(issue: Issue): string {
    const text = `${issue.title} ${issue.body}`.toLowerCase();

    if (text.includes('ui') || text.includes('フロントエンド') || text.includes('react')) {
      return 'frontend';
    }
    if (text.includes('api') || text.includes('バックエンド') || text.includes('server')) {
      return 'backend';
    }
    if (text.includes('deploy') || text.includes('infra') || text.includes('ci/cd')) {
      return 'infra';
    }
    if (text.includes('security') || text.includes('セキュリティ')) {
      return 'security';
    }
    if (text.includes('dx') || text.includes('開発体験') || text.includes('cli')) {
      return 'dx';
    }

    return 'backend';
  }
}
