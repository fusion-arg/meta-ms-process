import { Module } from '@nestjs/common';
import { ProcessStepService } from './process-step.service';
import { ProcessStepController } from './process-step.controller';
import { TypeOrmModule } from '../typeorm/typeorm.module';
import { CurrentProcessState } from '../current-process-state/entities/current-process-state.entity';
import { FutureProcessState } from '../presentation/entities/future-process-state.entity';
import { FileStorage } from '../file-storage/entities/file-storage.entity';
import { ImageTemplateBlock } from '../presentation/entities/image-template-block.entity';
import { TemplateBlock } from '../presentation/entities/template-block.entity';
import { TextTemplateBlock } from '../presentation/entities/text-template-block.entity';
import { PresentationService } from '../presentation/presentation.service';
import { SelectedFutureProcessModule } from '../selected-future-process/selected-future-process.module';
import { ImageTemplateService } from '../presentation/image-template.service';
import { TextTemplateService } from '../presentation/text-template.service';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { CurrentProcessPresentation } from '../presentation/entities/current-process-presentation.entity';
import { PresentationDraftImage } from '../presentation/entities/presentation-draft-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurrentProcessState,
      FutureProcessState,
      TemplateBlock,
      CurrentProcessPresentation,
      ImageTemplateBlock,
      TextTemplateBlock,
      FileStorage,
      PresentationDraftImage,
    ]),
    SelectedFutureProcessModule,
    FileStorageModule,
    ApiServiceModule,
  ],
  controllers: [ProcessStepController],
  providers: [
    ProcessStepService,
    PresentationService,
    ImageTemplateService,
    TextTemplateService,
  ],
})
export class ProcessStepModule {}
