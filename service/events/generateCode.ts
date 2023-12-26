import { assemblePrompt } from './prompts';
import { streamingOpenAIResponses } from './llm';
import { mockComletion } from './mock';

export interface IGenerateCodeParams {
  generationType: string;
  image: string;
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
}

const encoder = new TextEncoder();
export async function streamGenerateCode(
  params: IGenerateCodeParams,
  socket: { enqueue: (v: any) => any },
) {
  function noticeHost(data: Record<any, any>) {
    if (socket.enqueue) {
        socket.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
    }
  }
  const generated_code_config = params['generatedCodeConfig'];
  let prompt_messages;
  try {
    if (params['resultImage']) {
      prompt_messages = assemblePrompt(
        params['image'],
        generated_code_config,
        params['promptCode'],
        params['resultImage'],
      );
    } else {
      prompt_messages = assemblePrompt(
        params['image'],
        generated_code_config,
        params['promptCode'],
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
    history.forEach((item, index) => {
      prompt_messages.push({
        role: index % 2 === 0 ? 'assistant' : 'user',
        content: item,
      });
    });
  }

  let completion;
  const SHOULD_MOCK_AI_RESPONSE = params['mockAiResponse'];
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
