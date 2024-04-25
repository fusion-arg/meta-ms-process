import { Module } from '@nestjs/common';
import { MinioStorageService } from './minion-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorage } from './entities/file-storage.entity';
import { FileStorageController } from './file-storage.controller';
import { FileValidationPipe } from 'src/pipes/file-validation.pipe';

export const FILE_STORAGE_SERVICE = 'FILE_STORAGE_SERVICE';

@Module({
  imports: [TypeOrmModule.forFeature([FileStorage])],
  controllers: [FileStorageController],
  providers: [
    MinioStorageService,
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: MinioStorageService,
      // useClass: env.STORAGE_SERVICE === 'minio' ? MinioStorageService : Otro StorageService,
    },
    FileValidationPipe,
  ],
  exports: [MinioStorageService],
})
export class FileStorageModule {}
