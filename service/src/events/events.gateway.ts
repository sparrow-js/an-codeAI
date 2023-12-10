import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { streamGenerateCode } from './generateCode';

@WebSocketGateway({
  path: '/generate',
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log('findAll', data);
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  @SubscribeMessage('generatecode')
  async generateCode(client: Socket, data: any): Promise<void> {
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
    client.disconnect();
  }
}
