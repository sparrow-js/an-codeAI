export const codeReview = {
  label: 'code review',
  value: 'codeReview',
  messages: [
    {
      role: 'system',
      content: 'Review the following code',
    },
    {
      role: 'user',
      content: `Review the following [language] code for code smells and suggest improvements: [code block]`,
    },
  ],
};
