import { Octokit } from "@octokit/rest";

/**
 * Triggers a GitHub workflow to revert a commit in a repository
 * @param options Options for reverting a commit
 * @returns Result of the operation
 */
export async function revertCommit({
  commitSha,
  appName,
  branch = "main",
}: {
  commitSha: string;
  appName: string;
  branch?: string;
}) {
  try {
    const response = await fetch(
      "https://api.github.com/repos/wordixai/clone-action/actions/workflows/revert-remote.yml/dispatches",
      {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            commit_sha: commitSha,
            branch: branch,
            repo_name: `repo-${appName.replace('app-', '')}`,
            github_token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
            fly_app_name: appName
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`GitHub API error: ${errorData}`);
    }

    return {
      success: true,
      message: 'Revert workflow triggered successfully'
    };
  } catch (error) {
    console.error('Error in revert operation:', error);
    throw error;
  }
}
