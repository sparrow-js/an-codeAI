import { assemblePrompt } from './prompts';
import { streamingOpenAIResponses } from './llm';
import { mockComletion } from './mock';

export interface IGenerateCodeParams {
  generationType: string;
  image: string;
  text: string;
  openAiApiKey: string;
  openAiBaseURL: string;
  screenshotOneApiKey: null;
  isImageGenerationEnabled: true;
  editorTheme?: string;
  generatedCodeConfig: string;
  isTermOfServiceAccepted?: boolean;
  accessCode?: boolean;
  resultImage?: string;
  promptCode: string;
  history: any[];
  mockAiResponse?: boolean;
  llm: string;
  geminiApiKey: string;
  slug?: string;
  anthropicApiKey: string;
  anthropicBaseURL: string;
}

const encoder = new TextEncoder();
export async function streamGenerateCode(
  params: IGenerateCodeParams,
  socket: { enqueue: (v: any) => any },
  origin?: string,
) {
  function noticeHost(data: Record<any, any>) {
    if (socket.enqueue) {
        socket.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
    }
  }
  const generated_code_config = params['generatedCodeConfig'];
  let prompt_messages;
  const history = params['history'];
  const initTemplateCode = history && params.slug && params.slug !== 'create' ? history.splice(0, 1)[0] : '';
  try {
    if (params['resultImage']) {
      prompt_messages = await assemblePrompt(
        params['image'],
        params['text'],
        generated_code_config,
        params['promptCode'],
        params.slug,
        initTemplateCode,
        params['resultImage'],
      );
    } else {
      prompt_messages = await assemblePrompt(
        params['image'],
        params['text'],
        generated_code_config,
        params['promptCode'],
        params.slug,
        initTemplateCode
      );
    }
  } catch (e) {
    console.log(e);
    noticeHost({
      type: 'error',
      value: 'Prompt error!',
    });
  }

  if (params['generationType'] === 'update') {
    const history = params['history'];
    if (params.slug && params.slug !== 'create') {
      history.forEach((item, index) => {
        prompt_messages.push({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: item,
        });
      });
    } else {
      history.forEach((item, index) => {
        prompt_messages.push({
          role: index % 2 === 0 ? 'assistant' : 'user',
          content: item,
        });
      });
    }
  }

  let completion;
  const SHOULD_MOCK_AI_RESPONSE = params['mockAiResponse'];
  //test: params['generationType'] === 'create'
  if (SHOULD_MOCK_AI_RESPONSE) {
    completion = await mockComletion((content: any) => {
      noticeHost({
        type: 'chunk',
        value: content,
      });
    });
  } else {
    try {
      completion = await streamingOpenAIResponses(
        prompt_messages,
        (content: string, event?: string) => {
          if (event === 'error') {
            noticeHost({
              type: 'error',
              value: content,
            });
          } else {
            noticeHost({
              type: 'chunk',
              value: content,
            });
          }
        },
        {
          openAiApiKey: params.openAiApiKey,
          openAiBaseURL: params.openAiBaseURL,
          llm: params.llm, // 'Gemini'
          geminiApiKey: params.geminiApiKey,
          anthropicApiKey: params.anthropicApiKey,
          anthropicBaseURL: params.anthropicBaseURL
        },
      );
    } catch (e) {
      console.log(e);
      noticeHost({
        type: 'error',
        value: 'openAI request error!',
      });
    }
  }
  const updated_html = completion;
  noticeHost({
    type: 'setCode',
    value: updated_html,
  });
  noticeHost({
    type: 'status',
    value: 'Code generation complete.',
  });

  return updated_html;
}
