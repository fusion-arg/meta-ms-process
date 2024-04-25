import { Module } from '@nestjs/common';
import { ProcessMappingController } from './process-mapping.controller';
import { SelectedFutureProcess } from '../selected-future-process/entities/selected-future-process.entity';
import { ProcessMappingService } from './process-mapping.service';
import { ProcessMappingValidateFileService } from './process-mapping-validate-file.service';
import { ProcessMappingUploadFileService } from './process-mapping-upload-file.service';
import { ApiServiceModule } from '../../api-service/api-service.module';
import { TypeOrmModule } from '../typeorm/typeorm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SelectedFutureProcess]),
    ApiServiceModule,
  ],
  controllers: [ProcessMappingController],
  providers: [
    ProcessMappingService,
    ProcessMappingValidateFileService,
    ProcessMappingUploadFileService,
  ],
})
export class ProcessMappingModule {}
