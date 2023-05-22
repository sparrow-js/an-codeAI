import { Test, TestingModule } from '@nestjs/testing';
import { EditService } from './edit.service';

describe('EditService', () => {
  let service: EditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditService],
    }).compile();

    service = module.get<EditService>(EditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
