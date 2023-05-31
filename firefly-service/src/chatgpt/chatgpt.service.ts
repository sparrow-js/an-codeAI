import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';
import { react, command } from './prompt';

@Injectable()
export class ChatgptService {
  openai: any;
  configuration: any;
  apiKey: string;
  connect(id: string): any {
    this.apiKey = id;
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY || id,
    });
    this.openai = new OpenAIApi(this.configuration);
    return {
      status: 1,
      message: '',
    };
  }

  async generate(messages: ChatCompletionRequestMessage[]) {
    const { configuration, openai } = this;

    if (!configuration.apiKey) {
      return {
        status: 0,
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
        return {
          status: 1,
          data: {
            message: firstMessage.content,
          },
        };
      }
    }
  }

  getAppKey() {
    return {
      status: 1,
      data: {
        appKey: this.apiKey,
      },
    };
  }

  getPrompt() {
    return [react, command];
  }
}
