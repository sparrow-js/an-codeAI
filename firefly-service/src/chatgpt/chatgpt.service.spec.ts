import { Test, TestingModule } from '@nestjs/testing';
import { ChatgptService } from './chatgpt.service';

describe('ChatgptService', () => {
  let service: ChatgptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatgptService],
    }).compile();

    service = module.get<ChatgptService>(ChatgptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
