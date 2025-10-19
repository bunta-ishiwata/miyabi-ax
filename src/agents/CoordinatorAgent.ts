/**
 * CoordinatorAgent - タスク統括・並列実行制御
 *
 * 役割:
 * - IssueをタスクにDAG分解
 * - Critical Path特定
 * - 並列実行プランの作成
 * - 循環依存の検出
 */

import { BaseAgent } from '../core/BaseAgent.js';
import type {
  AgentResult,
  Task,
  DAGNode,
  ExecutionPlan,
  Issue
} from '../types/agent.js';

export class CoordinatorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'CoordinatorAgent',
      version: '1.0.0',
      description: 'タスク統括・並列実行制御Agent',
      capabilities: ['DAG分解', 'Critical Path分析', '並列実行最適化', '循環依存検出']
    });
  }

  protected async run(input: Issue): Promise<Partial<AgentResult>> {
    this.log('info', `Issue #${input.number} の分解を開始`);

    // Issue をタスクに分解
    const tasks = await this.decomposeTasks(input);
    this.log('info', `${tasks.length}個のタスクに分解完了`);

    // DAGを構築
    const dagNodes = this.buildDAG(tasks);
    this.log('info', 'DAG構築完了', { nodes: dagNodes.length });

    // 循環依存チェック
    const hasCycle = this.detectCycle(dagNodes);
    if (hasCycle) {
      throw new Error('循環依存が検出されました');
    }

    // 実行プランを作成
    const plan = this.createExecutionPlan(dagNodes);
    this.log('info', '実行プラン作成完了', plan);

    return {
      data: {
        tasks,
        dagNodes,
        plan
      },
      metadata: {
        totalTasks: tasks.length,
        levels: plan.levels,
        criticalPath: plan.criticalPath,
        estimatedDuration: plan.estimatedDuration
      }
    };
  }

  /**
   * IssueをTasksに分解
   */
  private async decomposeTasks(issue: Issue): Promise<Task[]> {
    // TODO: Claude APIを使って自動分解（Phase 2で実装）
    // 現在は簡易実装

    const tasks: Task[] = [];
    const lines = issue.body.split('\n');
    let taskId = 1;

    for (const line of lines) {
      // チェックボックス行を検出
      const match = line.match(/- \[ \] (.+)/);
      if (match) {
        const title = match[1].trim();
        tasks.push({
          id: `task-${taskId}`,
          title,
          description: title,
          type: this.inferTaskType(title),
          priority: this.inferPriority(issue),
          status: 'pending',
          dependencies: this.inferDependencies(taskId, title),
          complexity: this.inferComplexity(title),
          estimatedDuration: this.estimateDuration(title)
        });
        taskId++;
      }
    }

    return tasks;
  }

  /**
   * DAGを構築
   */
  private buildDAG(tasks: Task[]): DAGNode[] {
    const nodes: DAGNode[] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    // 各タスクのレベルを計算
    for (const task of tasks) {
      const level = this.calculateLevel(task, taskMap);
      nodes.push({
        taskId: task.id,
        level,
        dependencies: task.dependencies,
        task
      });
    }

    // レベルでソート
    nodes.sort((a, b) => a.level - b.level);

    return nodes;
  }

  /**
   * タスクレベルを計算（依存関係の深さ）
   */
  private calculateLevel(task: Task, taskMap: Map<string, Task>): number {
    if (task.dependencies.length === 0) return 0;

    let maxLevel = 0;
    for (const depId of task.dependencies) {
      const depTask = taskMap.get(depId);
      if (depTask) {
        const depLevel = this.calculateLevel(depTask, taskMap);
        maxLevel = Math.max(maxLevel, depLevel + 1);
      }
    }

    return maxLevel;
  }

  /**
   * 循環依存を検出
   */
  private detectCycle(nodes: DAGNode[]): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const node = nodes.find(n => n.taskId === nodeId);
      if (!node) return false;

      for (const depId of node.dependencies) {
        if (!visited.has(depId)) {
          if (dfs(depId)) return true;
        } else if (recStack.has(depId)) {
          return true; // 循環検出
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.taskId)) {
        if (dfs(node.taskId)) return true;
      }
    }

    return false;
  }

  /**
   * 実行プランを作成
   */
  private createExecutionPlan(nodes: DAGNode[]): ExecutionPlan {
    // レベルごとにグループ化（並列実行可能なタスク）
    const levelMap = new Map<number, DAGNode[]>();
    for (const node of nodes) {
      const group = levelMap.get(node.level) || [];
      group.push(node);
      levelMap.set(node.level, group);
    }

    const parallelGroups = Array.from(levelMap.values());

    // Critical Pathを特定（最長パス）
    const criticalPath = this.findCriticalPath(nodes);

    // 推定実行時間（Critical Pathの合計）
    const estimatedDuration = criticalPath.reduce((sum, taskId) => {
      const node = nodes.find(n => n.taskId === taskId);
      return sum + (node?.task.estimatedDuration || 0);
    }, 0);

    return {
      totalTasks: nodes.length,
      levels: parallelGroups.length,
      parallelGroups,
      criticalPath,
      estimatedDuration
    };
  }

  /**
   * Critical Path（最長パス）を特定
   */
  private findCriticalPath(nodes: DAGNode[]): string[] {
    // TODO: 動的計画法で最長パスを計算
    // 簡易実装: 最もレベルが深いパスを返す
    const maxLevel = Math.max(...nodes.map(n => n.level));
    const path: string[] = [];

    let currentLevel = maxLevel;
    while (currentLevel >= 0) {
      const node = nodes.find(n => n.level === currentLevel);
      if (node) {
        path.unshift(node.taskId);
      }
      currentLevel--;
    }

    return path;
  }

  /**
   * タスクタイプを推論
   */
  private inferTaskType(title: string): Task['type'] {
    const lower = title.toLowerCase();
    if (lower.includes('bug') || lower.includes('fix')) return 'bug';
    if (lower.includes('test')) return 'test';
    if (lower.includes('doc')) return 'docs';
    if (lower.includes('refactor')) return 'refactor';
    if (lower.includes('security')) return 'security';
    return 'feature';
  }

  /**
   * 優先度を推論
   */
  private inferPriority(issue: Issue): Task['priority'] {
    if (issue.labels.includes('P0-Critical')) return 'P0-Critical';
    if (issue.labels.includes('P1-High')) return 'P1-High';
    if (issue.labels.includes('P3-Low')) return 'P3-Low';
    return 'P2-Medium';
  }

  /**
   * 複雑度を推論
   */
  private inferComplexity(title: string): Task['complexity'] {
    const lower = title.toLowerCase();
    if (lower.includes('大規模') || lower.includes('アーキテクチャ')) return 'xlarge';
    if (lower.includes('統合') || lower.includes('実装')) return 'large';
    if (lower.includes('修正') || lower.includes('追加')) return 'medium';
    return 'small';
  }

  /**
   * 所要時間を推定（ミリ秒）
   */
  private estimateDuration(title: string): number {
    const lower = title.toLowerCase();
    if (lower.includes('大規模') || lower.includes('フレームワーク')) return 3600000; // 1時間
    if (lower.includes('実装') || lower.includes('作成')) return 1800000; // 30分
    if (lower.includes('修正') || lower.includes('追加')) return 600000; // 10分
    return 300000; // 5分
  }

  /**
   * 依存関係を推論（簡易実装）
   */
  private inferDependencies(taskId: number, title: string): string[] {
    // TODO: Claude APIで依存関係を自動推論
    // 現在は簡易実装: 前のタスクに依存
    if (taskId === 1) return [];

    const lower = title.toLowerCase();
    // テストは実装に依存
    if (lower.includes('test') || lower.includes('テスト')) {
      return [`task-${taskId - 1}`];
    }
    // デプロイはすべてのタスクに依存
    if (lower.includes('deploy') || lower.includes('デプロイ')) {
      const deps: string[] = [];
      for (let i = 1; i < taskId; i++) {
        deps.push(`task-${i}`);
      }
      return deps;
    }

    return [];
  }
}
