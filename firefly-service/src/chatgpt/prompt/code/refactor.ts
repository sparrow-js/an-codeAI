export const refactor = {
  label: 'refactor',
  value: 'refactor',
  messages: [
    {
      role: 'system',
      from: 'built-in',
      content:
        'I am a front-end development engineer, using technologies such as the antd UI framework',
    },
    {
      role: 'user',
      from: 'built-in',
      content: `Refactor the given [language] code to improve its error handling and resilience: [code block]`,
    },
  ],
};
