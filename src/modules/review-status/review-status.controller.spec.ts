import { Test, TestingModule } from '@nestjs/testing';
import { FutureProcessStatusList } from '../../enum/selected-future-process-status';
import { ReviewStatusSerializer } from '../../serializers/review-status.serializer';
import { ReviewStatusController } from './review-status.controller';

describe('ReviewStatusController', () => {
  let controller: ReviewStatusController;
  let serializer: ReviewStatusSerializer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewStatusController],
      providers: [ReviewStatusSerializer],
    }).compile();

    controller = module.get<ReviewStatusController>(ReviewStatusController);
    serializer = module.get<ReviewStatusSerializer>(ReviewStatusSerializer);
  });

  describe('findStatus', () => {
    it('should return an array of status options', async () => {
      const result = await controller.findFutureProcessStatus();
      expect(result).toEqual(serializer.respondMany(FutureProcessStatusList));
    });
  });
});
