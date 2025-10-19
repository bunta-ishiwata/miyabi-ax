/**
 * agent command - Agent実行・管理
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

import { AgentOrchestrator } from '../../core/AgentOrchestrator.js';
import type { Issue } from '../../types/agent.js';

export async function agentCommand(options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - Agent実行\n'));

  let issueNumber: number;

  if (options.issue) {
    issueNumber = parseInt(options.issue, 10);
  } else if (options.yes) {
    console.error(chalk.red('❌ --yes モードでは --issue <number> が必須です'));
    process.exit(1);
  } else {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'issueNumber',
        message: 'Issue番号を入力してください:',
        validate: (input: string) => {
          const num = parseInt(input, 10);
          if (isNaN(num) || num <= 0) {
            return 'valid なIssue番号を入力してください';
          }
          return true;
        }
      }
    ]);
    issueNumber = parseInt(answers.issueNumber, 10);
  }

  console.log(chalk.yellow(`\nIssue #${issueNumber} の自動処理を開始します...\n`));

  // Issueをフェッチ（モック実装）
  const issue: Issue = {
    number: issueNumber,
    title: `Issue #${issueNumber} の処理`,
    body: `- [ ] タスク1\n- [ ] タスク2\n- [ ] タスク3`,
    labels: [],
    state: 'open',
    assignees: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Orchestratorで実行
  const orchestrator = new AgentOrchestrator();
  const result = await orchestrator.processIssue(issue);

  // 結果表示
  orchestrator.printSummary(result);

  // 終了コード
  process.exit(result.success ? 0 : 1);
}
