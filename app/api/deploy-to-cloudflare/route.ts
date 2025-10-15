import { NextResponse } from "next/server";
import { deployToCloudflarePages } from "@/lib/deploy";
import { withDb } from '@/db/edge-db';
import { deploy, chats } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from "@/auth";

export async function POST(request: Request) {
    try {
        // Extract request body
        const body = await request.json();
        const { projectName, repo, appId } = body;
        
        // Get tokens from environment variables
        const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
        const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
        const cloudflareApiDnsToken = process.env.CLOUDFLARE_API_DNS_TOKEN;

        
        if (!githubToken) {
            return NextResponse.json(
                { error: 'GitHub token is not configured' },
                { status: 500 }
            );
        }
        
        if (!cloudflareApiToken) {
            return NextResponse.json(
                { error: 'Cloudflare API token is not configured' },
                { status: 500 }
            );
        }

        if (!cloudflareAccountId) {
            return NextResponse.json(
                { error: 'Cloudflare Account ID is not configured' },
                { status: 500 }
            );
        }

        if (!cloudflareZoneId) {
            return NextResponse.json(
                { error: 'Cloudflare Zone ID is not configured' },
                { status: 500 }
            );
        }

        if (!cloudflareApiDnsToken) {
            return NextResponse.json(
                { error: 'Cloudflare API DNS Token is not configured' },
                { status: 500 }
            );
        }

        // Get user session
        const session = await auth();
        const userId = session?.user?.id;
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        // Get shortId from chats table using appId
        const chatInfo = await withDb(db => 
            db.select({ shortId: chats.shortId })
            .from(chats)
            .where(eq(chats.id, appId))
            .limit(1)
        );

        const shortId = chatInfo?.[0]?.shortId || '';

        // Find chat record in database where chatId equals appId
        let chatRecord = await withDb(db => 
            db.query.deploy.findFirst({
                where: (deploy, { eq }) => eq(deploy.chatId, appId)
            })
        );

        // Generate Cloudflare project name if not provided
        const cloudflareProjectName = projectName || `genfly-${appId}`;

        if (chatRecord?.hostingStatus === 'init') {
            // Create/update the record with Cloudflare project details
            await withDb(db => 
                db.update(deploy)
                .set({
                    siteName: cloudflareProjectName,
                    hostingStatus: 'pending',
                    url: `https://${cloudflareProjectName}.pages.dev`,
                    metadata: { 
                        provider: 'cloudflare',
                        projectName: cloudflareProjectName 
                    }
                })
                .where(eq(deploy.chatId, appId))
            );

            chatRecord = {
                userId,
                chatId: appId,
                siteName: cloudflareProjectName,
                hostingStatus: 'pending',
                url: `https://${cloudflareProjectName}.pages.dev`,
            } as any;
        } else {
            // Update existing record to pending status
            await withDb(db => 
                db.update(deploy).set({ 
                    siteName: cloudflareProjectName,
                    hostingStatus: 'pending',
                    metadata: { 
                        provider: 'cloudflare',
                        projectName: cloudflareProjectName 
                    }
                }).where(eq(deploy.chatId, appId))
            );
        }
        
        

        // Trigger the GitHub Actions workflow
        const deployResponse = await deployToCloudflarePages(
            githubToken, 
            cloudflareApiToken, 
            cloudflareAccountId,
            cloudflareProjectName,
            cloudflareZoneId,
            cloudflareApiDnsToken,
            shortId,
            repo, 
            appId
        );

        if (deployResponse.error) {
            return NextResponse.json(
                { error: deployResponse.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            url: shortId,
            projectName: cloudflareProjectName,
            status: 'pending'
        });
    } catch (error) {
        console.error('Error deploying to Cloudflare Pages:', error);
        return NextResponse.json(
            { error: 'Failed to deploy to Cloudflare Pages' },
            { status: 500 }
        );
    }
}
