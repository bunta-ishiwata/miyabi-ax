/**
 * init command - 新しいプロジェクトを作成
 */

import chalk from 'chalk';
import ora from 'ora';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

export async function initCommand(projectName: string, options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - プロジェクト作成\n'));

  const projectPath = join(process.cwd(), projectName);
  let spinner = ora(`プロジェクト "${projectName}" を作成中...`).start();

  try {
    // 1. プロジェクトディレクトリ作成
    await mkdir(projectPath, { recursive: true });
    spinner.succeed(`ディレクトリ作成: ${projectName}`);

    // 2. Git初期化
    spinner = ora('Git リポジトリを初期化中...').start();
    execSync('git init', { cwd: projectPath, stdio: 'pipe' });
    spinner.succeed('Git リポジトリを初期化しました');

    // 3. package.json作成
    spinner = ora('package.json を作成中...').start();
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: `${projectName} - Powered by MIYABI AX`,
      type: 'module',
      scripts: {
        dev: 'tsx src/index.ts',
        build: 'tsc',
        test: 'vitest',
      },
      keywords: ['miyabi-ax', 'autonomous'],
      author: '',
      license: 'MIT',
    };
    await writeFile(
      join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    spinner.succeed('package.json を作成しました');

    // 4. README.md作成
    spinner = ora('README.md を作成中...').start();
    const readme = `# ${projectName}

Powered by [MIYABI AX](https://www.npmjs.com/package/miyabi-ax)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## MIYABI AX Commands

\`\`\`bash
npx miyabi-ax status    # ステータス確認
npx miyabi-ax agent     # Agent実行
npx miyabi-ax --help    # ヘルプ表示
\`\`\`
`;
    await writeFile(join(projectPath, 'README.md'), readme);
    spinner.succeed('README.md を作成しました');

    // 5. .gitignore作成
    spinner = ora('.gitignore を作成中...').start();
    const gitignore = `node_modules/
dist/
.env
*.log
.DS_Store
`;
    await writeFile(join(projectPath, '.gitignore'), gitignore);
    spinner.succeed('.gitignore を作成しました');

    // 6. src/ディレクトリとindex.ts作成
    spinner = ora('ソースファイルを作成中...').start();
    await mkdir(join(projectPath, 'src'));
    const indexTs = `console.log('Hello from ${projectName}!');
`;
    await writeFile(join(projectPath, 'src', 'index.ts'), indexTs);
    spinner.succeed('ソースファイルを作成しました');

    // 7. 初回コミット
    if (!options.skipInstall) {
      spinner = ora('初回コミットを作成中...').start();
      execSync('git add .', { cwd: projectPath, stdio: 'pipe' });
      execSync('git commit -m "Initial commit with MIYABI AX"', { cwd: projectPath, stdio: 'pipe' });
      spinner.succeed('初回コミットを作成しました');
    }

    console.log(chalk.green('\n✨ セットアップ完了！\n'));
    console.log(chalk.bold('次のステップ:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  npm install`));
    console.log(chalk.cyan(`  npx miyabi-ax status`));
    console.log(chalk.cyan(`  npx miyabi-ax agent\n`));

  } catch (error) {
    spinner.fail(chalk.red('プロジェクト作成に失敗しました'));
    if (error instanceof Error) {
      console.error(chalk.red(`\nエラー: ${error.message}\n`));
    }
    throw error;
  }
}
