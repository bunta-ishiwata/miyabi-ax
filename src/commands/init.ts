/**
 * init command - 新しいプロジェクトを作成
 * GitHub統合: リポジトリ作成 + ラベル設定
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import { getGitHubToken, createRepository, getAuthenticatedUser, createOctokit } from '../github/client';
import { setupLabels } from '../github/labels';

export async function initCommand(projectName: string, options: any): Promise<void> {
  console.log(chalk.cyan('\n🌸 MIYABI AX - プロジェクト作成\n'));
  console.log(chalk.gray('ローカル実行 + GitHub統合\n'));

  const projectPath = join(process.cwd(), projectName);
  let spinner: any;

  try {
    // 0. GitHub認証確認
    const token = getGitHubToken();
    let githubUser: any = null;
    let githubRepo: any = null;
    let createGitHubRepo = false;

    if (token) {
      spinner = ora('GitHub認証を確認中...').start();
      try {
        githubUser = await getAuthenticatedUser(token);
        spinner.succeed(`GitHub認証済み: ${chalk.cyan(githubUser.login)}`);

        // GitHub リポジトリ作成確認
        if (!options.yes) {
          const { shouldCreateRepo } = await inquirer.prompt([{
            type: 'confirm',
            name: 'shouldCreateRepo',
            message: 'GitHubリポジトリを作成しますか？',
            default: true,
          }]);
          createGitHubRepo = shouldCreateRepo;
        } else {
          createGitHubRepo = true;
        }

      } catch (error) {
        spinner.fail('GitHub認証に失敗しました');
        console.log(chalk.yellow('\n💡 GitHub統合をスキップしてローカルのみで作成します\n'));
      }
    } else {
      console.log(chalk.yellow('💡 GitHub token not found - ローカルのみで作成します'));
      console.log(chalk.gray('   GitHub統合するには: export GITHUB_TOKEN=xxx または gh auth login\n'));
    }

    // 1. GitHubリポジトリ作成（オプション）
    if (createGitHubRepo && token) {
      spinner = ora(`GitHubリポジトリ作成中: ${projectName}...`).start();
      try {
        githubRepo = await createRepository(projectName, options.private || false, token);
        spinner.succeed(`GitHubリポジトリ作成: ${chalk.cyan(githubRepo.html_url)}`);

        // ラベル設定
        spinner = ora('識学理論準拠の53ラベルを設定中...').start();
        const octokit = createOctokit(token);
        const labelResult = await setupLabels(githubUser.login, projectName, octokit);
        spinner.succeed(`ラベル設定完了: ${labelResult.created} created, ${labelResult.updated} updated`);

      } catch (error: any) {
        spinner.fail('GitHubリポジトリ作成に失敗');
        if (error.message?.includes('already exists')) {
          console.log(chalk.yellow(`\n⚠️  リポジトリ "${projectName}" は既に存在します`));
          console.log(chalk.white('   別の名前を試してください: '), chalk.cyan(`${projectName}-2\n`));
        }
        throw error;
      }
    }

    // 2. プロジェクトディレクトリ作成
    spinner = ora(`プロジェクト "${projectName}" を作成中...`).start();
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

    // 7. 初回コミット & GitHubプッシュ
    if (!options.skipInstall) {
      spinner = ora('初回コミットを作成中...').start();
      execSync('git add .', { cwd: projectPath, stdio: 'pipe' });
      execSync('git commit -m "Initial commit with MIYABI AX"', { cwd: projectPath, stdio: 'pipe' });
      spinner.succeed('初回コミットを作成しました');

      // GitHubにプッシュ
      if (githubRepo) {
        spinner = ora('GitHubにプッシュ中...').start();
        try {
          execSync(`git remote add origin ${githubRepo.clone_url}`, { cwd: projectPath, stdio: 'pipe' });
          execSync('git branch -M main', { cwd: projectPath, stdio: 'pipe' });
          execSync('git push -u origin main', { cwd: projectPath, stdio: 'pipe' });
          spinner.succeed(`GitHubにプッシュ: ${chalk.cyan(githubRepo.html_url)}`);
        } catch (error) {
          spinner.fail('GitHubへのプッシュに失敗');
          console.log(chalk.yellow('   手動でプッシュしてください:'));
          console.log(chalk.gray(`     cd ${projectName}`));
          console.log(chalk.gray(`     git remote add origin ${githubRepo.clone_url}`));
          console.log(chalk.gray(`     git push -u origin main\n`));
        }
      }
    }

    console.log(chalk.green('\n✨ セットアップ完了！\n'));

    if (githubRepo) {
      console.log(chalk.bold('🎉 GitHub統合完了:'));
      console.log(chalk.gray(`   リポジトリ: ${githubRepo.html_url}`));
      console.log(chalk.gray(`   53ラベル設定済み\n`));
    }

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
