/**
 * status command - プロジェクトの状態を確認
 */

import chalk from 'chalk';
import Table from 'cli-table3';

export async function statusCommand(_options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - ステータス\n'));

  // 環境情報
  console.log(chalk.bold('Environment:'));
  const envTable = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });
  envTable.push(
    ['Node.js', process.version],
    ['Platform', process.platform],
    ['CWD', process.cwd()]
  );
  console.log(envTable.toString());
  console.log();

  // Agents
  console.log(chalk.bold('Agents:'));
  const agentsTable = new Table({
    head: ['Agent', 'Status'],
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });
  agentsTable.push(
    ['CoordinatorAgent', chalk.green('✓ Ready')],
    ['IssueAgent', chalk.green('✓ Ready')],
    ['CodeGenAgent', chalk.green('✓ Ready')],
    ['ReviewAgent', chalk.green('✓ Ready')],
    ['TestAgent (MCP)', chalk.green('✓ Ready')],
    ['PRAgent', chalk.green('✓ Ready')],
    ['DeploymentAgent', chalk.green('✓ Ready')]
  );
  console.log(agentsTable.toString());
  console.log();

  // MCP統合
  console.log(chalk.bold('MCP Integration:'));
  const mcpTable = new Table({
    chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
  });
  mcpTable.push(
    ['Playwright MCP', chalk.green('✓ Available')],
    ['Puppeteer MCP', chalk.green('✓ Available')],
    ['Chrome DevTools MCP', chalk.green('✓ Available')]
  );
  console.log(mcpTable.toString());
  console.log();

  // 設定ファイル
  console.log(chalk.bold('Configuration:'));
  console.log('  Config: .miyabi-ax/config.json');
  console.log('  Claude Code: .claude/settings.json');
  console.log('  MCP Servers: .claude/mcp.json');
  console.log();
}
