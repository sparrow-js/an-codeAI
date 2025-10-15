import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the screenshot service URL from environment variables
    const screenshotUrl = process.env.NEXT_PUBLIC_SCREENSHOT_URL;
    
    if (!screenshotUrl) {
      return NextResponse.json(
        { error: 'Screenshot service URL not configured' },
        { status: 500 }
      );
    }
    // Forward the request to the screenshot service
    const response = await fetch(screenshotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Screenshot service error:', errorText);
      return NextResponse.json(
        { error: 'Screenshot service request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Screenshot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
