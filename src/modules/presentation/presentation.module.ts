import { Module } from '@nestjs/common';
import { TypeOrmModule } from '../typeorm/typeorm.module';
import { FutureProcessState } from './entities/future-process-state.entity';
import { FutureProcessPresentationController } from './future-process-presentation.controller';
import { PresentationService } from './presentation.service';
import { SelectedFutureProcessModule } from '../selected-future-process/selected-future-process.module';
import { TemplateBlock } from './entities/template-block.entity';
import { ImageTemplateBlock } from './entities/image-template-block.entity';
import { TextTemplateBlock } from './entities/text-template-block.entity';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { FileStorage } from '../file-storage/entities/file-storage.entity';
import { ImageTemplateService } from './image-template.service';
import { TextTemplateService } from './text-template.service';
import { MinioStorageService } from '../file-storage/minion-storage.service';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { CurrentProcessState } from '../current-process-state/entities/current-process-state.entity';
import { CurrentProcessPresentationController } from './current-process-presentation.controller';
import { CurrentProcessPresentation } from './entities/current-process-presentation.entity';
import { PresentationDraftImage } from './entities/presentation-draft-image.entity';
import { PresentationController } from './presentation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FutureProcessState,
      CurrentProcessState,
      CurrentProcessPresentation,
      TemplateBlock,
      ImageTemplateBlock,
      TextTemplateBlock,
      FileStorage,
      PresentationDraftImage,
    ]),
    SelectedFutureProcessModule,
    FileStorageModule,
    ApiServiceModule,
  ],
  controllers: [
    FutureProcessPresentationController,
    CurrentProcessPresentationController,
    PresentationController,
  ],
  providers: [
    PresentationService,
    ImageTemplateService,
    TextTemplateService,
    MinioStorageService,
  ],
})
export class PresentationModule {}
