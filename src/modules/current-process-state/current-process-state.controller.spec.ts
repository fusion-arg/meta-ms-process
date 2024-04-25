import { Test, TestingModule } from '@nestjs/testing';
import { CurrentProcessStateController } from './current-process-state.controller';
import { CurrentProcessStateService } from './current-process-state.service';

describe('CurrentProcessStateController', () => {
  let controller: CurrentProcessStateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentProcessStateController],
      providers: [CurrentProcessStateService],
    }).compile();

    controller = module.get<CurrentProcessStateController>(
      CurrentProcessStateController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
