
import { auth } from 'auth';
import { NextResponse } from 'next/server';
import { pushFiles } from '@/utils/git/push-files';
import { gitPullOriginMain } from '@/utils/machines';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { appId, files } = body;

    try {
        const result = await pushFiles({
            token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
            owner: 'wordixai',
            repo: `repo-${appId.replace('app-', '')}`,
            files: files,
            message: 'Update files',
        });

        const isReInstall = files.some((x: { path: string }) => x.path.includes('package.json'));
    
    
        const resultFly =  await gitPullOriginMain(appId, isReInstall);
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
