/**
 * setup command - セットアップガイドを表示
 */

import chalk from 'chalk';

export async function setupCommand(_options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - セットアップガイド\n'));

  console.log(chalk.bold('1. 環境変数の設定'));
  console.log('   .env ファイルを作成してください:');
  console.log(chalk.gray('   GITHUB_TOKEN=your_github_token'));
  console.log(chalk.gray('   ANTHROPIC_API_KEY=your_anthropic_key'));
  console.log();

  console.log(chalk.bold('2. Claude Code設定'));
  console.log('   .claude/settings.json が自動生成されます');
  console.log();

  console.log(chalk.bold('3. MCP設定'));
  console.log('   .claude/mcp.json でMCPサーバーが設定されます:');
  console.log(chalk.gray('   - Playwright MCP'));
  console.log(chalk.gray('   - Puppeteer MCP'));
  console.log(chalk.gray('   - Chrome DevTools MCP'));
  console.log();

  console.log(chalk.bold('4. 次のステップ'));
  console.log('   npx miyabi-ax status    # 状態確認');
  console.log('   npx miyabi-ax agent     # Agent実行');
  console.log();
}
