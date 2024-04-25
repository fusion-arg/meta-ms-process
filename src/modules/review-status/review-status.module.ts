import { Module } from '@nestjs/common';
import { ReviewStatusController } from './review-status.controller';

@Module({
  controllers: [ReviewStatusController],
})
export class ReviewStatusModule {}
