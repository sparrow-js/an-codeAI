import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      id: 10001,
      name: 'hello',
    };
  }
}
