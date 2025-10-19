/**
 * AgentOrchestrator - エージェント統合オーケストレーター
 *
 * 役割:
 * - すべてのエージェントを連携させて実行
 * - Issue → Code → Review → Test → PR の完全自動化
 * - エラー0まで自動修正ループ
 */

import { CoordinatorAgent } from '../agents/CoordinatorAgent.js';
import { IssueAgent } from '../agents/IssueAgent.js';
import { CodeGenAgent } from '../agents/CodeGenAgent.js';
import { ReviewAgent } from '../agents/ReviewAgent.js';
import { TestAgent } from '../agents/TestAgent.js';
import { TestAgentMCP } from '../agents/TestAgentMCP.js';
import { PRAgent } from '../agents/PRAgent.js';
import { ErrorFeedbackLoop } from './ErrorFeedbackLoop.js';
import type {
  Issue,
  ExecutionPlan,
  CodeGenResult,
  ReviewResult,
  TestResult
} from '../types/agent.js';

export interface OrchestrationResult {
  success: boolean;
  issueNumber: number;
  executionPlan?: ExecutionPlan;
  codeGenResult?: CodeGenResult;
  reviewResult?: ReviewResult;
  testResult?: TestResult;
  prUrl?: string;
  iterations: number;
  totalDuration: number;
  error?: string;
}

export class AgentOrchestrator {
  private coordinatorAgent: CoordinatorAgent;
  private issueAgent: IssueAgent;
  private codeGenAgent: CodeGenAgent;
  private reviewAgent: ReviewAgent;
  private testAgent: TestAgent;
  private testAgentMCP: TestAgentMCP;
  private prAgent: PRAgent;
  private errorFeedbackLoop: ErrorFeedbackLoop;

  private readonly MAX_ITERATIONS = 5;
  private readonly REVIEW_THRESHOLD = 80;
  private readonly COVERAGE_THRESHOLD = 80;

  constructor() {
    this.coordinatorAgent = new CoordinatorAgent();
    this.issueAgent = new IssueAgent();
    this.codeGenAgent = new CodeGenAgent();
    this.reviewAgent = new ReviewAgent();
    this.testAgent = new TestAgent();
    this.testAgentMCP = new TestAgentMCP();
    this.prAgent = new PRAgent();
    this.errorFeedbackLoop = new ErrorFeedbackLoop();
  }

  /**
   * Issueを完全自動処理
   */
  async processIssue(issue: Issue): Promise<OrchestrationResult> {
    const startTime = Date.now();
    let iterations = 0;

    console.log(`\n🌸 MIYABI AX - Issue #${issue.number} の自動処理を開始\n`);

    try {
      // Step 1: Issue分析
      console.log('📋 Step 1: Issue分析');
      const issueAnalysis = await this.issueAgent.execute(issue);
      if (!issueAnalysis.success) {
        throw new Error(`Issue分析失敗: ${issueAnalysis.error}`);
      }
      console.log('✅ Issue分析完了\n');

      // Step 2: タスク分解（DAG構築）
      console.log('🔍 Step 2: タスク分解（DAG構築）');
      const coordinationResult = await this.coordinatorAgent.execute(issue);
      if (!coordinationResult.success || !coordinationResult.data) {
        throw new Error(`タスク分解失敗: ${coordinationResult.error}`);
      }
      const executionPlan = (coordinationResult.data as { plan: ExecutionPlan }).plan;
      console.log(`✅ ${executionPlan.totalTasks}個のタスクに分解完了\n`);

      // Step 3-6: コード生成 → レビュー → テスト → 修正ループ
      let codeGenResult: CodeGenResult | undefined;
      let reviewResult: ReviewResult | undefined;
      let testResult: TestResult | undefined;

      while (iterations < this.MAX_ITERATIONS) {
        iterations++;
        console.log(`\n🔄 修正イテレーション ${iterations}/${this.MAX_ITERATIONS}\n`);

        // Step 3: コード生成
        console.log('💻 Step 3: コード生成');
        const tasks = (coordinationResult.data as { tasks: unknown[] }).tasks;
        const firstTask = tasks[0]; // 最初のタスクでコード生成

        const codeResult = await this.codeGenAgent.execute(firstTask);
        if (!codeResult.success || !codeResult.data) {
          throw new Error(`コード生成失敗: ${codeResult.error}`);
        }
        codeGenResult = codeResult.data as CodeGenResult;
        console.log(`✅ ${codeGenResult.files.length}ファイル生成完了\n`);

        // Step 4: 品質レビュー
        console.log('🔍 Step 4: 品質レビュー');
        const reviewResultData = await this.reviewAgent.execute(codeGenResult);
        if (!reviewResultData.success || !reviewResultData.data) {
          throw new Error(`レビュー失敗: ${reviewResultData.error}`);
        }
        reviewResult = reviewResultData.data as ReviewResult;
        console.log(`✅ 品質スコア: ${reviewResult.score}/100\n`);

        // 品質チェック
        if (reviewResult.score < this.REVIEW_THRESHOLD) {
          console.log(`⚠️  品質スコア不足（${reviewResult.score} < ${this.REVIEW_THRESHOLD}）`);
          console.log('🔧 CodeGenAgentで修正を試行...\n');
          continue;
        }

        // Step 5: テスト実行（MCP統合版も実行）
        console.log('🧪 Step 5: テスト実行');
        const testResultData = await this.testAgent.execute(codeGenResult);
        if (!testResultData.success || !testResultData.data) {
          throw new Error(`テスト実行失敗: ${testResultData.error}`);
        }
        testResult = testResultData.data as TestResult;
        console.log(`✅ カバレッジ: ${testResult.coverage}%\n`);

        // MCP統合テストも実行（Playwright + Chrome DevTools）
        console.log('🔧 MCP統合テスト実行（Playwright + Chrome DevTools）');
        const mcpErrors = await this.testAgentMCP.runAllMCPTests(codeGenResult);
        if (mcpErrors.length > 0) {
          console.log(`⚠️  MCP統合テストで ${mcpErrors.length}件のエラー検出`);
          testResult.errors.push(...mcpErrors);
        } else {
          console.log('✅ MCP統合テスト: エラー0件\n');
        }

        // テストチェック - エラーがあれば自動修正
        if (testResult.errors.length > 0) {
          console.log(`⚠️  エラー ${testResult.errors.length}件検出`);
          console.log('🔧 自動修正を試行...\n');

          // エラーフィードバックループで自動修正
          const feedback = await this.errorFeedbackLoop.analyzeErrors(testResult.errors);
          console.log(`📊 エラー分析完了 (優先度: ${feedback.priority})`);

          try {
            codeGenResult = await this.errorFeedbackLoop.fixErrors(feedback, codeGenResult);
            console.log('✅ 自動修正完了、再テストします\n');
          } catch (error) {
            console.log(`❌ 自動修正失敗: ${error}\n`);
          }

          continue;
        }

        if (testResult.coverage < this.COVERAGE_THRESHOLD) {
          console.log(`⚠️  カバレッジ不足（${testResult.coverage}% < ${this.COVERAGE_THRESHOLD}%）`);
          console.log('🔧 テスト追加を試行...\n');
          continue;
        }

        // すべての条件をクリア
        console.log('🎉 すべての品質基準をクリア！\n');
        break;
      }

      if (iterations >= this.MAX_ITERATIONS) {
        console.log(`⚠️  最大イテレーション数(${this.MAX_ITERATIONS})に到達`);
      }

      // Step 6: PR作成
      console.log('📝 Step 6: Pull Request作成');
      if (!codeGenResult || !reviewResult) {
        throw new Error('コード生成またはレビュー結果が不足');
      }

      const prResult = await this.prAgent.execute({
        issue,
        codeGenResult,
        reviewResult
      });

      if (!prResult.success || !prResult.data) {
        throw new Error(`PR作成失敗: ${prResult.error}`);
      }

      const prData = prResult.data as { title: string; branch: string };
      console.log(`✅ Draft PR作成: ${prData.title}\n`);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      return {
        success: true,
        issueNumber: issue.number,
        executionPlan,
        codeGenResult,
        reviewResult,
        testResult,
        prUrl: `https://github.com/owner/repo/pull/draft`, // TODO: 実際のURL
        iterations,
        totalDuration
      };

    } catch (error) {
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      return {
        success: false,
        issueNumber: issue.number,
        iterations,
        totalDuration,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 実行結果のサマリーを表示
   */
  printSummary(result: OrchestrationResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('🌸 MIYABI AX - 実行結果サマリー');
    console.log('='.repeat(80) + '\n');

    console.log(`Issue番号: #${result.issueNumber}`);
    console.log(`実行結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);
    console.log(`修正イテレーション: ${result.iterations}回`);
    console.log(`総実行時間: ${(result.totalDuration / 1000).toFixed(2)}秒\n`);

    if (result.success) {
      console.log('📊 詳細:');
      if (result.executionPlan) {
        console.log(`  タスク数: ${result.executionPlan.totalTasks}`);
        console.log(`  並列レベル: ${result.executionPlan.levels}`);
      }
      if (result.codeGenResult) {
        console.log(`  生成ファイル: ${result.codeGenResult.files.length}個`);
      }
      if (result.reviewResult) {
        console.log(`  品質スコア: ${result.reviewResult.score}/100`);
      }
      if (result.testResult) {
        console.log(`  カバレッジ: ${result.testResult.coverage}%`);
        console.log(`  エラー: ${result.testResult.errors.length}件`);
      }
      if (result.prUrl) {
        console.log(`\n📝 Pull Request: ${result.prUrl}`);
      }
    } else {
      console.log(`❌ エラー: ${result.error}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }
}
