import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.isValidFileType(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('File is too large');
    }

    return file;
  }

  private isValidFileType(mimeType: string): boolean {
    const allowedTypes =
      this.configService.get<string>('FILE_STORAGE_TYPES')?.split(',') || [];
    return allowedTypes.includes(mimeType);
  }
}
