import { NextResponse } from "next/server";
import { createNetlifySite, deployToNetlify } from "@/utils/netlify";
import { withDb } from '@/db/edge-db';
import { deploy } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from "@/auth";


export async function POST(request: Request) {
    try {

        // Extract request body
        const body = await request.json();
        const { siteName, repo, appId } = body;
        
        // Get GitHub token from environment variable
        const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
        // Get Netlify token from environment variable
        const netlifyToken = process.env.NEXT_PUBLIC_NETLIFY_TOKEN;
        
        if (!githubToken) {
            return NextResponse.json(
                { error: 'GitHub token is not configured' },
                { status: 500 }
            );
        }
        
        if (!netlifyToken) {
            return NextResponse.json(
                { error: 'Netlify token is not configured' },
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
        
        // Find chat record in database where chatId equals appId
        let chatRecord = await withDb(db => 
            db.query.deploy.findFirst({
                where: (deploy, { eq }) => eq(deploy.chatId, appId)
            })
        );


        let siteId = chatRecord?.siteId;

        if (chatRecord?.hostingStatus === 'init') {
            const response = await createNetlifySite(siteName);
            siteId = response.id;
            if (!response?.id) {
                return NextResponse.json(
                    { error: 'Failed to create Netlify site' },
                    { status: 500 }
                );
            }

        // Create a record in the deploy table
            await withDb(db => 
                db.update(deploy)
                .set({
                    siteId: response.id,
                    hostingStatus: 'pending',
                    url: response.url,
                })
                .where(eq(deploy.chatId, appId))
            );

            chatRecord = {
                userId,
                chatId: appId,
                siteName,
                siteId: response.id,
                hostingStatus: 'pending',
                url: response.url,
            } as any;
        } else {
            await withDb(db => 
                db.update(deploy).set({ hostingStatus: 'pending' }).where(eq(deploy.chatId, appId))
            );
        }


       if (!siteId) {
        return NextResponse.json(
            { error: 'Site ID is not configured' },
            { status: 500 }
        );
       }

        const deployResponse = await deployToNetlify(githubToken, netlifyToken, repo, siteId, appId);
        // Add GitHub response status to the response

        return NextResponse.json({
            url: chatRecord?.url,
            siteId: chatRecord?.siteId,
            status: 'pending'
        });
    } catch (error) {
        console.error('Error deploying to Netlify:', error);
        return NextResponse.json(
            { error: 'Failed to deploy to Netlify' },
            { status: 500 }
        );
    }
}