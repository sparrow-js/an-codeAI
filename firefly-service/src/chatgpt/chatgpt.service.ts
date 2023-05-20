import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

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

  async generate(text: string) {
    const { configuration, openai } = this;
    if (!configuration.apiKey) {
      return {
        error: {
          message:
            'OpenAI API key not configured, please follow instructions in README.md',
        },
      };
    }

    const animal = 'cat';
    if (animal.trim().length === 0) {
      return {
        error: {
          message: 'Please enter a valid animal',
        },
      };
    }

    try {
      const completion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: text,
        temperature: 0.6,
      });
      console.log(completion.data);
      return { result: completion.data.choices[0].text };
    } catch (error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        return {
          status: 0,
          message: error.response.data,
        };
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        return {
          error: {
            message: 'An error occurred during your request.',
          },
        };
      }
    }
  }
}
