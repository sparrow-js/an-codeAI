import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';

@Injectable()
export class ChatgptService {
  openai: any;
  configuration: any;
  connect(id: string): any {
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY || id,
    });
    this.openai = new OpenAIApi(this.configuration);
    return {
      status: 0,
    };
  }

  async generate(messages: ChatCompletionRequestMessage[]) {
    const { configuration, openai } = this;

    if (!configuration.apiKey) {
      return {
        error: {
          message:
            'OpenAI API key not configured, please follow instructions in README.md',
        },
      };
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      messages,
    });
    if (response.data.choices.length) {
      const firstMessage = response.data.choices[0].message;
      if (firstMessage) {
        return firstMessage.content;
      }
    }
  }
}
