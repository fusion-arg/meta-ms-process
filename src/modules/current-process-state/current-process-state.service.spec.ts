import { Test, TestingModule } from '@nestjs/testing';
import { CurrentProcessStateService } from './current-process-state.service';

describe('CurrentProcessStateService', () => {
  let service: CurrentProcessStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrentProcessStateService],
    }).compile();

    service = module.get<CurrentProcessStateService>(
      CurrentProcessStateService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
