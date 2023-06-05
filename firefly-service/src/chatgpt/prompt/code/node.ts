export const node = {
  label: 'node',
  value: 'node',
  messages: [
    {
      role: 'system',
      content: 'Add comments to the code',
    },
    {
      role: 'user',
      content: `Review the following [language] code for code smells and suggest improvements: [code block]`,
    },
  ],
};
