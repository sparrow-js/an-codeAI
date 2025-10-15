// app/api/enhancer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { streamText } from '@/lib/.server/llm/stream-text';
import { stripIndents } from '@/utils/stripIndent'; // Adjusted import path
import type { ProviderInfo } from '@/types/model'; // Adjusted import path
import { auth } from 'auth';

export const runtime = 'edge';
export async function POST(request: NextRequest) {
  try {
    const { message, model, provider, apiKeys: providedApiKeys } = await request.json() as {
      message: string;
      model: string;
      provider: ProviderInfo;
      apiKeys?: Record<string, string>;
    };

    const session = await auth();
    if (!session) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    const { name: providerName } = provider;

    // Validate 'model' and 'provider' fields
    if (!model || typeof model !== 'string') {
      return new NextResponse('Invalid or missing model', {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    if (!providerName || typeof providerName !== 'string') {
      return new NextResponse('Invalid or missing provider', {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    const apiKeys = providedApiKeys;

    const result = await streamText({
      messages: [
        {
          role: 'user',
          content:
            stripIndents`
            You are a professional prompt engineer specializing in crafting precise, effective prompts.
            Your task is to enhance prompts by making them more specific, actionable, and effective.

            I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

            For valid prompts:
            - Make instructions explicit and unambiguous
            - Add relevant context and constraints
            - Remove redundant information
            - Maintain the core intent
            - Ensure the prompt is self-contained
            - Use professional language

            For invalid or unclear prompts:
            - Respond with clear, professional guidance
            - Keep responses concise and actionable
            - Maintain a helpful, constructive tone
            - Focus on what the user should provide
            - Use a standard template for consistency

            IMPORTANT: Your response must ONLY contain the enhanced prompt text.
            Do not include any explanations, metadata, or wrapper tags.

            <original_prompt>
              ${message}
            </original_prompt>
          `,
        },
      ],
      env: process.env as any, // Use process.env in Next.js (adjust as needed)
    });

    return new NextResponse(result.textStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked', // Correct header name in Next.js
      },
    });
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof Error && error.message?.includes('API key')) {
      return new NextResponse('Invalid or missing API key', {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    return new NextResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}