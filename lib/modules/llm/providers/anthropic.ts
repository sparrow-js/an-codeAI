import { BaseProvider } from '@/lib/modules/llm/base-provider';
import type { ModelInfo } from '@/lib/modules/llm/types';
import type { LanguageModelV1 } from 'ai';
import type { IProviderSetting } from '@/types/model';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';


export default class AnthropicProvider extends BaseProvider {
  name = 'Anthropic';
  getApiKeyLink = 'https://console.anthropic.com/settings/keys';

  config = {
    apiTokenKey: 'ANTHROPIC_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'anthropic/claude-3.7-sonnet',
      label: 'Claude 3.7 Sonnet',
      provider: 'Anthropic',
      maxTokenAllowed: 128000,
    },
    {
      name: 'anthropic/claude-sonnet-4',
      label: 'Claude Sonnet 4',
      provider: 'Anthropic',
      maxTokenAllowed: 64000,
    },
    {
      name: 'anthropic/claude-3.5-sonnet',
      label: 'Claude 3.5 Sonnet (new)',
      provider: 'Anthropic',
      maxTokenAllowed: 8000,
    },
    // {
    //   name: 'anthropic/claude-3.5-sonnet-20240620',
    //   label: 'Claude 3.5 Sonnet (old)',
    //   provider: 'Anthropic',
    //   maxTokenAllowed: 8000,
    // },
    // {
    //   name: 'anthropic/claude-3.5-haiku',
    //   label: 'Claude 3.5 Haiku (new)',
    //   provider: 'Anthropic',
    //   maxTokenAllowed: 8000,
    // },
  ];
  getModelInstance: (options: {
    model: string;
    serverEnv?: Record<string, string>;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }) => LanguageModelV1 = (options) => {

    const { apiKeys, providerSettings, serverEnv, model } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'ANTHROPIC_API_KEY',
    });
    const anthropic = createOpenAI({
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    // const anthropic = createAnthropic({
    //   apiKey: process.env.ANTHROPIC_API_KEY,
    //   baseUrl: 'https://api.openai-proxy.org/anthropic/v1',
    // });

    return anthropic(model);
  };
}
