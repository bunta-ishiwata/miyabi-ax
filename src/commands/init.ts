/**
 * init command - 新しいプロジェクトを作成
 */

import chalk from 'chalk';
import ora from 'ora';

export async function initCommand(projectName: string, _options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - プロジェクト作成\n'));

  const spinner = ora(`プロジェクト "${projectName}" を作成中...`).start();

  // TODO: 実際のプロジェクト作成ロジック
  await new Promise(resolve => setTimeout(resolve, 1000));

  spinner.succeed(`プロジェクト "${projectName}" を作成しました`);

  console.log(chalk.green('\n✨ セットアップ完了！\n'));
  console.log('次のステップ:');
  console.log(`  cd ${projectName}`);
  console.log(`  npx miyabi-ax status`);
  console.log(`  npx miyabi-ax agent\n`);
}
