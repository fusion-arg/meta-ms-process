import { Module } from '@nestjs/common';
import { CurrentProcessStateService } from './current-process-state.service';
import { CurrentProcessStateController } from './current-process-state.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentProcessState } from './entities/current-process-state.entity';
import { AssociatedProcess } from './entities/associated-process.entity';
import { AssociatedSpc } from './entities/associated-spc.entity';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { PresentationModule } from '../presentation/presentation.module';
import { TemplateBlock } from '../presentation/entities/template-block.entity';
import { FileStorage } from '../file-storage/entities/file-storage.entity';
import { CurrentProcessPresentation } from '../presentation/entities/current-process-presentation.entity';
import { SelectedFutureProcess } from 'src/modules/selected-future-process/entities/selected-future-process.entity';
import { RequestCapturingService } from 'src/modules/current-process-state/request-capturing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurrentProcessState,
      AssociatedProcess,
      AssociatedSpc,
      CurrentProcessPresentation,
      TemplateBlock,
      FileStorage,
      SelectedFutureProcess,
    ]),
    ApiServiceModule,
    PresentationModule,
  ],
  controllers: [CurrentProcessStateController],
  providers: [CurrentProcessStateService, RequestCapturingService],
})
export class CurrentProcessStateModule {}
