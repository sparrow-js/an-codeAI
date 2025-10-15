import { reinstallDependencies } from "@/utils/machines";
import { broadcast } from "@/utils/broadcast";



export const deploy = async (sourceRepoUrl: string, appName: string, dockerImage: string) => {
    const response = await fetch(
        'https://api.github.com/repos/wordixai/clone-action/actions/workflows/clone.yml/dispatches',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    source_repo_url: sourceRepoUrl,
                    new_repo_name: `repo-${appName}`,
                    github_token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
                    fly_api_token: process.env.FLY_API_TOKEN,
                    fly_app_name: `${appName}`,
                    docker_image: dockerImage || "registry.fly.io/needware-app:latest",
                    client_id: appName,
                    cloudflare_api_token: process.env.CLOUDFLARE_API_TOKEN,
                    cloudflare_project_name: `preview--${appName}`,
                    cloudflare_account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response;
};


export const redeploy = async (
    sourceRepoUrl: string,
    clientId: string,
    dockerImage?: string,
) => {
    const response = await fetch(
        `https://api.github.com/repos/wordixai/clone-action/actions/workflows/redeploy.yml/dispatches`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    source_repo_url: sourceRepoUrl,
                    fly_api_token: process.env.FLY_API_TOKEN,
                    fly_app_name: `${clientId}`,
                    docker_image: dockerImage || "registry.fly.io/needware-app:latest",
                    client_id: clientId,
                    github_token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response;
};


export const installDependenciesAction = async (
    appId: string, 
    customDependencies: string = "",
    commitMessage: string = "Update package.json dependencies"
) => {

    await broadcast(appId, 'message', { 
        chatId: appId,
        status: 'installing',
        type: 'install'
      });
    const response = await fetch(
        `https://api.github.com/repos/wordixai/clone-action/actions/workflows/install.yml/dispatches`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    fly_api_token: process.env.FLY_API_TOKEN,
                    fly_app_name: appId,
                    custom_dependencies: customDependencies,
                    git_user_email: 'needwareofficial@gmail.com',
                    git_user_name: 'needware',
                    commit_message: commitMessage,
                    client_id: appId,
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response;
};


export async function deployToNetlify(githubToken: string, netlifyToken: string, repo: string, siteId: string, appId: string) {
    // Trigger GitHub Actions workflow
    const githubResponse = await fetch(
       "https://api.github.com/repos/wordixai/clone-action/actions/workflows/deploy-to-netlify.yml/dispatches",
       {
           method: 'POST',
           headers: {
               Accept: 'application/vnd.github+json',
               Authorization: `Bearer ${githubToken}`,
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               ref: 'main',
               inputs: {
                   repository_url: repo,
                   netlify_auth_token: netlifyToken,
                   netlify_site_id: siteId,
                   github_token: githubToken,
                   app_id: appId
               }
           })
       }
   );
   
   if (!githubResponse.ok) {
       const errorText = await githubResponse.text();
       return { error: `GitHub API error: ${githubResponse.status} - ${errorText}`};
   }

   // Check if response is empty
   const responseText = await githubResponse.text();


   if (!responseText) {
       console.log('Empty response from GitHub API - workflow dispatch successful');
       return { success: true };
   }

   try {
       const data = JSON.parse(responseText);

       console.log('GitHub API response:', data);
       return data;
   } catch (error) {
       console.error('Error parsing GitHub API response:', error);
       return { error: 'Failed to parse GitHub API response' };
   }
}

export async function deployToCloudflarePages(
    githubToken: string, 
    cloudflareApiToken: string, 
    cloudflareAccountId: string,
    cloudflareProjectName: string,
    cloudflareZoneId: string,
    cloudflareApiDnsToken: string,
    custom_domain: string,
    repo: string, 
    appId: string
) {

    console.log('custom_domain', {
        repository_url: repo,
        cloudflare_api_token: cloudflareApiToken,
        cloudflare_account_id: cloudflareAccountId,
        cloudflare_project_name: cloudflareProjectName,
        cloudflare_zone_id: cloudflareZoneId,
        cloudflare_api_dns_token: cloudflareApiDnsToken,
        github_token: githubToken,
        custom_domain: custom_domain,
        app_id: appId
    });

    // Trigger GitHub Actions workflow for Cloudflare Pages deployment
    const githubResponse = await fetch(
       "https://api.github.com/repos/wordixai/clone-action/actions/workflows/deploy-to-cloudflare.yml/dispatches",
       {
           method: 'POST',
           headers: {
               Accept: 'application/vnd.github+json',
               Authorization: `Bearer ${githubToken}`,
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               ref: 'main',
               inputs: {
                   repository_url: repo,
                   cloudflare_api_token: cloudflareApiToken,
                   cloudflare_account_id: cloudflareAccountId,
                   cloudflare_project_name: cloudflareProjectName,
                   cloudflare_zone_id: cloudflareZoneId,
                   cloudflare_api_dns_token: cloudflareApiDnsToken,
                   github_token: githubToken,
                   custom_domain: custom_domain,
                   app_id: appId
               }
           })
       }
   );
   
   if (!githubResponse.ok) {
       const errorText = await githubResponse.text();
       return { error: `GitHub API error: ${githubResponse.status} - ${errorText}`};
   }

   // Check if response is empty
   const responseText = await githubResponse.text();

   if (!responseText) {
       console.log('Empty response from GitHub API - workflow dispatch successful');
       return { success: true };
   }

   try {
       const data = JSON.parse(responseText);
       console.log('GitHub API response:', data);
       return data;
   } catch (error) {
       console.error('Error parsing GitHub API response:', error);
       return { error: 'Failed to parse GitHub API response' };
   }
}


