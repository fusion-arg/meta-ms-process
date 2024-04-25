import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from './entities/file-storage.entity';
import { IFileStorageService } from 'src/contracts/file-storage.contract';

@Injectable()
export class MinioStorageService implements IFileStorageService {
  private readonly minioClient: Client;
  private readonly endPoint: string;
  private readonly port: number;
  private readonly bucketName: string;
  private readonly urlExpiry: number;

  constructor(
    @InjectRepository(FileStorage)
    private fileStorageRepository: Repository<FileStorage>,
    private configService: ConfigService,
  ) {
    this.endPoint = this.configService.get<string>('MINIO_ENDPOINT');
    this.port = +this.configService.get<number>('MINIO_PORT');
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
    this.urlExpiry =
      +this.configService.get<string>('MINIO_URL_EXPIRY') || null;

    this.minioClient = new Client({
      endPoint: this.endPoint,
      port: this.port,
      useSSL: this.configService.get<string>('MINIO_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async upload(
    file: Express.Multer.File,
  ): Promise<{ id: string; url: string }> {
    try {
      const filename = `${new Date().toISOString()}_${file.originalname}`;
      await this.minioClient.putObject(this.bucketName, filename, file.buffer);
      const fileStorage = this.fileStorageRepository.create({
        id: uuidv4(),
        filename,
        bucketName: this.bucketName,
      });
      await this.fileStorageRepository.save(fileStorage);
      const urlPresigned = await this.getPresignedUrl(
        this.bucketName,
        filename,
        this.urlExpiry,
      );
      return { id: fileStorage.id, url: urlPresigned };
    } catch (error) {
      Logger.error('Error uploading file', error.stack, 'MinioStorageService');
      throw new InternalServerErrorException(
        `Unable to upload the image: ${error.message}`,
      );
    }
  }

  async getPresignedUrl(
    bucketName: string,
    filename: string,
    expiry: number,
  ): Promise<string> {
    expiry = expiry * 60 * 60;
    return this.minioClient.presignedGetObject(bucketName, filename, expiry);
  }
}
