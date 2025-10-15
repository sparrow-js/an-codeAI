interface CloudflareDeployment {
  id: string;
  url: string;
  created_on: string;
  latest_stage: {
    status: 'idle' | 'active' | 'canceled' | 'success' | 'failure';
  };
}

interface CloudflareApiResponse {
  success: boolean;
  result: CloudflareDeployment[];
}

interface DeploymentStatusResult {
  status: 'idle' | 'active' | 'canceled' | 'success' | 'failure' | 'no_deployments';
  url?: string;
  created_on?: string;
}

interface CloudflareError {
  error: string;
  statusCode: number;
}

/**
 * 检查 Cloudflare Pages 项目的最新部署状态
 * @param projectName - Cloudflare Pages 项目名称
 * @returns Promise<DeploymentStatusResult | CloudflareError> - 部署状态信息或错误信息
 */
export async function checkCloudflareDeploymentStatus(
  projectName: string
): Promise<DeploymentStatusResult | CloudflareError> {
  try {
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!cloudflareApiToken || !cloudflareAccountId) {
      return {
        error: 'Cloudflare credentials not configured',
        statusCode: 500
      };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/pages/projects/${projectName}/deployments?per_page=1&order=created_on&direction=desc`,
      {
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
        },
      }
    );

    if (!response.ok) {
      return {
        error: `Cloudflare API error: ${response.status}`,
        statusCode: response.status
      };
    }

    const data: CloudflareApiResponse = await response.json();
    const latestDeployment = data.result[0];

    if (!latestDeployment) {
      return { status: 'no_deployments' };
    }

    return {
      status: latestDeployment.latest_stage.status,
      url: latestDeployment.url,
      created_on: latestDeployment.created_on
    };

  } catch (error) {
    return {
      error: 'Internal server error',
      statusCode: 500
    };
  }
}