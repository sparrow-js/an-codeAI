import type { BaseMessage } from "@langchain/core/messages";


export function convertToOpenAIMessages(messages: BaseMessage[] | any[]) {
    const roleMapping = {
        human: "user",
        ai: "assistant",
        system: "system"
    } as const;
  
    const openAIMessages = messages.map(msg => {
        // Handle LangChain BaseMessage format
        if (msg.getType) {
            const originalRole = msg.getType().toLowerCase() as keyof typeof roleMapping;
            const openAIRole = roleMapping[originalRole] || originalRole;
            return {
                role: openAIRole,
                content: msg.content
            };
        }
        
        // Handle custom message format
        const role = msg.role?.toLowerCase() as keyof typeof roleMapping;
        const openAIRole = roleMapping[role] || role || 'user';
        
        // Handle complex content structure
        const content = msg.content;
        // if (Array.isArray(content)) {
        //     content = content.map(item => {
        //         if (item.type === 'text') return item.text;
        //         if (item.type === 'image') return `[Image: ${item.image}]`;
        //         return JSON.stringify(item);
        //     }).join('\n');
        // }
        
        return {
            role: openAIRole,
            content: content
        };
    });
  
    return openAIMessages;
  }

interface MessageContent {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

export function convertMessageStructure(messages: any[]) {
  return messages.map(msg => {
    if (Array.isArray(msg.content)) {
      return {
        role: msg.role,
        content: msg.content.map((item: MessageContent) => {
          if (item.type === 'text') {
            return {
              type: 'text',
              text: item.text
            };
          } else if (item.type === 'image_url') {
            return {
              type: 'image',
              image: new URL(item.image_url?.url || '')
            };
          }
          return item;
        })
      };
    }
    return msg;
  });
}