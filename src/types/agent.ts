/**
 * MIYABI AX - Agent型定義
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
}

export interface AgentResult {
  success: boolean;
  agentName: string;
  duration: number;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * タスク定義
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[]; // Task IDs
  assignedAgent?: AgentType;
  estimatedDuration?: number;
  complexity: TaskComplexity;
}

export type TaskType =
  | 'feature'
  | 'bug'
  | 'refactor'
  | 'docs'
  | 'test'
  | 'chore'
  | 'security';

export type TaskPriority = 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low';

export type TaskStatus =
  | 'pending'
  | 'analyzing'
  | 'implementing'
  | 'reviewing'
  | 'testing'
  | 'deploying'
  | 'done';

export type TaskComplexity = 'small' | 'medium' | 'large' | 'xlarge';

export type AgentType =
  | 'coordinator'
  | 'issue'
  | 'codegen'
  | 'review'
  | 'test'
  | 'pr'
  | 'deployment';

/**
 * DAG（Directed Acyclic Graph）ノード
 */
export interface DAGNode {
  taskId: string;
  level: number; // 並列実行レベル（0が最初）
  dependencies: string[];
  task: Task;
}

/**
 * 実行計画
 */
export interface ExecutionPlan {
  totalTasks: number;
  levels: number;
  parallelGroups: DAGNode[][];
  criticalPath: string[];
  estimatedDuration: number;
}

/**
 * Issue情報
 */
export interface Issue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  state: 'open' | 'closed';
  assignees: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * コード生成結果
 */
export interface CodeGenResult {
  files: GeneratedFile[];
  summary: string;
  qualityScore?: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

/**
 * レビュー結果
 */
export interface ReviewResult {
  score: number; // 0-100
  passed: boolean; // 80点以上でtrue
  issues: ReviewIssue[];
  summary: string;
}

export interface ReviewIssue {
  file: string;
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule?: string;
}

/**
 * テスト結果
 */
export interface TestResult {
  passed: boolean;
  coverage: number; // パーセンテージ
  errors: TestError[];
  summary: string;
}

export interface TestError {
  type: 'console' | 'runtime' | 'assertion';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
}
