import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';


import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

// 功能函数，用于从base64数据URL中提取MIME类型和纯base64数据部分
function extractMimeAndBase64(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 data URL");
  }
  return { mimeType: matches[1], base64Data: matches[2] };
}

// 转换函数
function transformData(data: Record<any, any>[]) {
  const parts = [];

  // 遍历原始数据，合并文本内容
  for (const item of data) {
    if (item.content) {
      if (typeof item.content === "string") {
        // 对于系统角色的文本内容
        parts.push({ text: item.content });
      } else if (Array.isArray(item.content)) {
        // 对于用户角色的内容数组
        for (const part of item.content) {
          if (part.type === "text") {
            parts.push({ text: part.text });
          } else if (part.type === "image_url") {
            // 提取MIME类型和base64数据
            const { mimeType, base64Data } = extractMimeAndBase64(
              part.image_url.url
            );
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            });
          }
        }
      }
    }
  }

  // 返回新的数据结构，所有文本和图像都合并到一个用户角色中
  return [
    {
      role: "user",
      parts: parts,
    },
  ];
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];
async function useGeminiResponse([messages, callback, params]: Parameters<
  typeof streamingOpenAIResponses
>) {
  let genAI = new GoogleGenerativeAI(
    params.geminiApiKey || process.env["GEMINI_API_KEY"]
  );
  const generationConfig = {
    temperature: 0,
    topK: 32,
    topP: 1,
    maxOutputTokens: 30000, //
  };

  const contents = transformData(messages);
  const parts = contents[0].parts;
  let modelType = 'gemini-pro'
  if (parts && parts[1] && parts[1].inlineData) {
    modelType = "gemini-pro-vision"
  }

  const model = genAI.getGenerativeModel({ model:  modelType});

  const result = await model.generateContentStream({
    contents: contents,
    generationConfig,
    safetySettings,
  });

  let text = "";
  let perText = "";
  for await (const chunk of result.stream) {
    if (perText) {
      callback(perText);
      text += perText;
    }
    const chunkText = text
      ? chunk.text()
      : chunk.text().replace(/^\s*```html/g, "");
    perText = chunkText;
  }
  perText = perText.replace(/```\s*$/g, "");
  callback(perText);
  text += perText;
  return text;
}


export async function streamingOpenAIResponses(
  messages: any,
  callback: {
    (content: string, event?: string | undefined): void;
    (arg0: string, arg1: string | undefined): void;
  },
  params: {
    openAiApiKey: any;
    openAiBaseURL: any;
    llm: string;
    geminiApiKey: any;
    anthropicApiKey: any;
    anthropicBaseURL: any
  }
) {
  if (params.llm === "gemini") {
    const full_response = await useGeminiResponse([messages, callback, params]);
    return full_response;
  }
  if (params.llm === "anthropic") {
      const options: {
        apiKey: string;
        baseURL?: string;
      } = {
        apiKey: params.anthropicApiKey, // This is the default and can be omitted
      }
      if (params.anthropicBaseURL) {
        options.baseURL = params.anthropicBaseURL
      }
      const anthropic = new Anthropic(options);
      const systemMessage = messages.splice(0, 1)[0];
      const aMessages = messages.map((message: any) => {
        const {content} = message;
        if (Array.isArray(content)) {
          message.content = content.map((item) => {
            let temp = item;
            // console.log(item.image_url.url)
            if (item.type === 'image_url') {
              const imageUrl = item.image_url.url
              temp = {
                type: "image",
                source: {
                  type: "base64",
                    media_type: imageUrl.split(";")[0].split(":")[1],
                    data: imageUrl.split(",")[1],
                },
              }
            }
            return temp;
          })

        }
        return message;
      })

      const stream = anthropic.messages
      .stream({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        system: systemMessage.content,
        messages: aMessages
      })
      .on('text', (text) => {
        callback(text);
      });

    const message = await stream.finalMessage();
    return message;
  }



  if (!params.openAiApiKey) {
    callback('No openai key, set it', 'error');
    return '';
  }
  const openai = new OpenAI({
    apiKey: params.openAiApiKey || process.env['OPENAI_API_KEY'], // defaults to process.env["OPENAI_API_KEY"]
    baseURL:
      params.openAiBaseURL ||
      process.env['OPENAI_BASE_URL'] ||
      'https://api.openai.com/v1',
  });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-2024-05-13',
    temperature: 0,
    max_tokens: 4096,
    messages,
    stream: true,
  });
  let full_response = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    full_response += content;
    callback(content);
  }

  return full_response;
}
