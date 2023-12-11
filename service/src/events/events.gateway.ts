import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
} from '@nestjs/websockets';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { streamGenerateCode } from './generateCode';

@WebSocketGateway(9000)
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('generatecode')
  async generateCode(client: WebSocket, data: any): Promise<void> {
    /**
     {
      generationType: 'create',
      image: 'image',
      openAiApiKey: '****',
      openAiBaseURL: '****',
      screenshotOneApiKey: null,
      isImageGenerationEnabled: true,
      editorTheme: 'cobalt',
      generatedCodeConfig: 'react_tailwind',
      isTermOfServiceAccepted: false,
      accessCode: null
    }
     */
    await streamGenerateCode(data, client);
    client.close();
  }
}
