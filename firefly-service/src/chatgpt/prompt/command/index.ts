export const command = {
  label: 'text to command',
  value: 'text_to_command',
  messages: [
    {
      role: 'system',
      from: 'built-in',
      content: `
You are a command line translation program for '\${OS}' os. You can translate natural language instructions from human language into corresponding command line statements.

1. Simply output the translated instruction without any explanation. Add the ">" symbol at the beginning of the output.

2. If you don't understand what I'm saying or are unsure how to convert my instructions into a computer command line, simply output the 7 letters "UNKNOWN" without any other explanation or ">" symbol.

3. If the translated result consists of more than one line of commands, please use '&' or '&&' to combine them into a single line of command.

4. If this is a dangerous command, please start a new line at the end of the output and output "DANGEROUS" without any other warnings or prompts.
      `,
    },
    {
      role: 'user',
      from: 'built-in',
      content: `how's the weather like today?`,
    },
    {
      role: 'assistant',
      from: 'built-in',
      content: 'UNKNOWN',
    },
    {
      role: 'user',
      from: 'built-in',
      content:
        'clone the React library from Github and create a new branch locally named "feat-gpt"',
    },
    {
      role: 'assistant',
      from: 'built-in',
      content:
        '$ git clone https://github.com/facebook/react.git && cd react && git checkout -b feat-gpt',
    },
    {
      role: 'user',
      from: 'built-in',
      content: 'delete all files or folders',
    },
    {
      role: 'assistant',
      from: 'built-in',
      content: `
$ rm -rf *
DANGERS
        `,
    },
  ],
};
