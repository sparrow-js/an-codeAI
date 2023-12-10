import OpenAI from 'openai';

export async function streamingOpenAIResponses(messages, callback, params) {
  const openai = new OpenAI({
    apiKey: params.openAiApiKey || process.env['OPENAI_API_KEY'], // defaults to process.env["OPENAI_API_KEY"]
    baseURL:
      params.openAiBaseURL ||
      process.env['OPENAI_BASE_URL'] ||
      'https://api.openai.com/v1',
  });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
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
