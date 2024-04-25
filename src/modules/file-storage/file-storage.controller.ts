import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IFileStorageService } from 'src/contracts/file-storage.contract';
import { FileValidationPipe } from 'src/pipes/file-validation.pipe';

@Controller('image')
export class FileStorageController {
  constructor(
    @Inject('FILE_STORAGE_SERVICE')
    private readonly fileStorageService: IFileStorageService,
  ) {}
  @Post()
  @UseInterceptors(FileInterceptor('file_image'))
  async uploadFile(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ) {
    const uploadResult = await this.fileStorageService.upload(file);
    return uploadResult;
  }
}
