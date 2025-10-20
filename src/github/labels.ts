/**
 * GitHub labels setup - 識学理論準拠の53ラベル
 */

import { Octokit } from '@octokit/rest';
import chalk from 'chalk';

export interface Label {
  name: string;
  color: string;
  description: string;
}

/**
 * 識学理論準拠の53ラベル定義
 */
export const MIYABI_LABELS: Label[] = [
  // Type (7 labels)
  { name: 'type:bug', color: 'd73a4a', description: 'バグ修正' },
  { name: 'type:feature', color: 'a2eeef', description: '新機能' },
  { name: 'type:refactor', color: 'fbca04', description: 'リファクタリング' },
  { name: 'type:docs', color: '0075ca', description: 'ドキュメント' },
  { name: 'type:test', color: '1d76db', description: 'テスト' },
  { name: 'type:chore', color: 'fef2c0', description: '雑務' },
  { name: 'type:security', color: 'd93f0b', description: 'セキュリティ' },

  // Priority (4 labels)
  { name: 'priority:P0-critical', color: 'b60205', description: '最優先' },
  { name: 'priority:P1-high', color: 'd93f0b', description: '高優先度' },
  { name: 'priority:P2-medium', color: 'fbca04', description: '中優先度' },
  { name: 'priority:P3-low', color: '0e8a16', description: '低優先度' },

  // State (8 labels)
  { name: 'state:pending', color: 'ededed', description: '未着手' },
  { name: 'state:analyzing', color: 'd4c5f9', description: '分析中' },
  { name: 'state:implementing', color: '5319e7', description: '実装中' },
  { name: 'state:reviewing', color: 'fbca04', description: 'レビュー中' },
  { name: 'state:testing', color: '1d76db', description: 'テスト中' },
  { name: 'state:deploying', color: '0e8a16', description: 'デプロイ中' },
  { name: 'state:done', color: '0e8a16', description: '完了' },
  { name: 'state:blocked', color: 'd73a4a', description: 'ブロック中' },

  // Agent (7 labels)
  { name: 'agent:coordinator', color: 'bfd4f2', description: 'CoordinatorAgent' },
  { name: 'agent:codegen', color: 'd4c5f9', description: 'CodeGenAgent' },
  { name: 'agent:review', color: 'c2e0c6', description: 'ReviewAgent' },
  { name: 'agent:test', color: 'c5def5', description: 'TestAgent' },
  { name: 'agent:pr', color: 'fef2c0', description: 'PRAgent' },
  { name: 'agent:deployment', color: 'bfdadc', description: 'DeploymentAgent' },
  { name: 'agent:issue', color: 'e99695', description: 'IssueAgent' },

  // Complexity (4 labels)
  { name: 'complexity:small', color: 'c2e0c6', description: '小規模' },
  { name: 'complexity:medium', color: 'fbca04', description: '中規模' },
  { name: 'complexity:large', color: 'd93f0b', description: '大規模' },
  { name: 'complexity:xlarge', color: 'b60205', description: '特大規模' },

  // Phase (6 labels)
  { name: 'phase:planning', color: 'bfd4f2', description: '計画' },
  { name: 'phase:design', color: 'd4c5f9', description: '設計' },
  { name: 'phase:implementation', color: '5319e7', description: '実装' },
  { name: 'phase:testing', color: '1d76db', description: 'テスト' },
  { name: 'phase:deployment', color: '0e8a16', description: 'デプロイ' },
  { name: 'phase:maintenance', color: 'fbca04', description: '保守' },

  // Impact (4 labels)
  { name: 'impact:breaking', color: 'd73a4a', description: '破壊的変更' },
  { name: 'impact:major', color: 'd93f0b', description: '大きな影響' },
  { name: 'impact:minor', color: 'fbca04', description: '小さな影響' },
  { name: 'impact:patch', color: 'c2e0c6', description: 'パッチレベル' },

  // Category (5 labels)
  { name: 'category:frontend', color: '5319e7', description: 'フロントエンド' },
  { name: 'category:backend', color: '1d76db', description: 'バックエンド' },
  { name: 'category:infra', color: '0e8a16', description: 'インフラ' },
  { name: 'category:dx', color: 'fbca04', description: '開発者体験' },
  { name: 'category:security', color: 'd93f0b', description: 'セキュリティ' },

  // Effort (6 labels)
  { name: 'effort:1h', color: 'c2e0c6', description: '1時間' },
  { name: 'effort:4h', color: 'bfdadc', description: '4時間' },
  { name: 'effort:1d', color: 'bfd4f2', description: '1日' },
  { name: 'effort:3d', color: 'fbca04', description: '3日' },
  { name: 'effort:1w', color: 'd93f0b', description: '1週間' },
  { name: 'effort:2w', color: 'b60205', description: '2週間' },

  // Blocked (2 labels)
  { name: 'blocked:waiting-review', color: 'fbca04', description: 'レビュー待ち' },
  { name: 'blocked:waiting-deployment', color: 'd93f0b', description: 'デプロイ待ち' },
];

/**
 * Setup labels on GitHub repository
 */
export async function setupLabels(
  owner: string,
  repo: string,
  octokit: Octokit
): Promise<{ created: number; updated: number; skipped: number }> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Get existing labels
  const { data: existingLabels } = await octokit.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100,
  });

  const existingLabelNames = new Set(existingLabels.map(l => l.name));

  // Create or update each label
  for (const label of MIYABI_LABELS) {
    try {
      if (existingLabelNames.has(label.name)) {
        // Update existing label
        await octokit.issues.updateLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description,
        });
        updated++;
      } else {
        // Create new label
        await octokit.issues.createLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description,
        });
        created++;
      }
    } catch (error: any) {
      if (error.status === 422) {
        // Label already exists (race condition)
        skipped++;
      } else {
        console.error(chalk.red(`  ✗ ${label.name}: ${error.message}`));
        throw error;
      }
    }
  }

  return { created, updated, skipped };
}
