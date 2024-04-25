export interface IFileStorageService {
  upload(file: Express.Multer.File): Promise<{ id: string; url: string }>;
  getPresignedUrl(
    bucketName: string,
    filename: string,
    expiry: number,
  ): Promise<string>;
}
