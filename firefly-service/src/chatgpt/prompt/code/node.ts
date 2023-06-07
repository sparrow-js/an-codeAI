export const node = {
  label: 'node',
  value: 'node',
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
      content: `Review the following [language] code for code smells and suggest improvements: [code block]`,
    },
  ],
};
