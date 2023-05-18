import { Test, TestingModule } from '@nestjs/testing';
import { ChatgptController } from './chatgpt.controller';

describe('ChatgptController', () => {
  let controller: ChatgptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatgptController],
    }).compile();

    controller = module.get<ChatgptController>(ChatgptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
