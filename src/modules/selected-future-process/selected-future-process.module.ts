import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../typeorm/typeorm.module';
import { SelectedFutureProcess } from './entities/selected-future-process.entity';
import { SelectedFutureProcessController } from './selected-future-process.controller';
import { SelectedFutureProcessService } from './selected-future-process.service';
import { ApiServiceModule } from 'src/api-service/api-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SelectedFutureProcess]),
    ApiServiceModule,
  ],
  controllers: [SelectedFutureProcessController],
  providers: [SelectedFutureProcessService],
  exports: [SelectedFutureProcessService],
})
export class SelectedFutureProcessModule {}
