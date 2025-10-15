
import { NextResponse } from 'next/server';
import { withDb } from '@/db/edge-db';
import { credits } from '@/db/schema';
import { auth } from 'auth';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const workspaceId = url.searchParams.get('workspaceId');

        if (!workspaceId) {
            return new NextResponse("Workspace ID is required", { status: 400 });
        }

        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 获取当前用户信息
        const userId = session.user.id;
        
        // 确保userId不为undefined
        if (!userId) {
            return new NextResponse("User ID not found", { status: 400 });
        }
        
        try {
            const userCredits = await withDb(db => db.select({
                id: credits.id,
                workspaceId: credits.workspaceId,
                totalCredits: credits.totalCredits,
                createdAt: credits.createdAt,
                usedCredits: credits.usedCredits
            }).from(credits)
            .where(eq(credits.workspaceId, workspaceId))
            .limit(1)
            );
            
            if (userCredits.length === 0) {
                return NextResponse.json({ credits: 0 });
            }
            
            return NextResponse.json({ 
                credits: userCredits[0].totalCredits - userCredits[0].usedCredits,
                totalCredits: userCredits[0].totalCredits,
                usage: userCredits[0].usedCredits
             });
        } catch (error) {
            console.error('Failed to fetch credits:', error);
            return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
        }
    } catch (error) {
        console.error('Failed to fetch credits:', error);
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
}
