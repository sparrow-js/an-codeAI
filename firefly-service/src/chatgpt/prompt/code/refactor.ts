export const refactor = {
  label: 'refactor',
  value: 'refactor',
  messages: [
    {
      role: 'system',
      content: 'Refactor to the code',
    },
    {
      role: 'user',
      content: `Refactor the given [language] code to improve its error handling and resilience: [code block]`,
    },
  ],
};
