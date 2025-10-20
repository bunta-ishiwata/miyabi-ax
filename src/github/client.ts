/**
 * GitHub API client
 */

import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

/**
 * Get GitHub token from environment or gh CLI
 */
export function getGitHubToken(): string | null {
  // 1. Check GITHUB_TOKEN environment variable
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

  // 2. Try to get token from gh CLI
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8', stdio: 'pipe' }).trim();
    if (token) {
      return token;
    }
  } catch {
    // gh CLI not installed or not authenticated
  }

  return null;
}

/**
 * Create Octokit instance
 */
export function createOctokit(token?: string): Octokit {
  const authToken = token || getGitHubToken();

  if (!authToken) {
    throw new Error('GitHub token not found. Please set GITHUB_TOKEN or run `gh auth login`');
  }

  return new Octokit({ auth: authToken });
}

/**
 * Create GitHub repository
 */
export async function createRepository(
  name: string,
  isPrivate: boolean = false,
  token?: string
): Promise<any> {
  const octokit = createOctokit(token);

  const { data } = await octokit.repos.createForAuthenticatedUser({
    name,
    description: `${name} - Powered by MIYABI AX`,
    private: isPrivate,
    has_issues: true,
    has_projects: false,
    has_wiki: false,
    auto_init: false, // We'll push initial commit ourselves
  });

  return data;
}

/**
 * Get authenticated user info
 */
export async function getAuthenticatedUser(token?: string) {
  const octokit = createOctokit(token);
  const { data } = await octokit.users.getAuthenticated();
  return data;
}
