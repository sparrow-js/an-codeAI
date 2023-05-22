import { Test, TestingModule } from '@nestjs/testing';
import { EditController } from './edit.controller';

describe('EditController', () => {
  let controller: EditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditController],
    }).compile();

    controller = module.get<EditController>(EditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
