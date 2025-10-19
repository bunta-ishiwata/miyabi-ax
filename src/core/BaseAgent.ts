/**
 * BaseAgent - すべてのMIYABI AIエージェントの基底クラス
 *
 * 識学理論に基づく設計:
 * - 責任の明確化
 * - 権限の委譲
 * - 結果の評価
 */

import type { AgentConfig, AgentResult, AgentStatus } from '../types/agent.js';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected status: AgentStatus = 'idle';
  protected startTime?: number;
  protected endTime?: number;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * エージェントを実行
   */
  async execute<T = unknown>(input: T): Promise<AgentResult> {
    this.status = 'running';
    this.startTime = Date.now();

    try {
      const result = await this.run(input);
      this.status = 'completed';
      this.endTime = Date.now();

      return {
        success: true,
        agentName: this.config.name,
        duration: this.getDuration(),
        ...result
      };
    } catch (error) {
      this.status = 'failed';
      this.endTime = Date.now();

      return {
        success: false,
        agentName: this.config.name,
        duration: this.getDuration(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * エージェント固有の処理（サブクラスで実装）
   */
  protected abstract run(input: unknown): Promise<Partial<AgentResult>>;

  /**
   * 実行時間を取得
   */
  protected getDuration(): number {
    if (!this.startTime || !this.endTime) return 0;
    return this.endTime - this.startTime;
  }

  /**
   * 現在のステータスを取得
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * ログ出力（共通フォーマット）
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.name}] [${level.toUpperCase()}]`;

    console.log(`${prefix} ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}
