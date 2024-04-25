import { FileUploadResponseDto } from '../modules/process-mapping/dto/file-upload-response.dto';
import { BaseSerializer } from './base.serializer';

export class UploadFileSerializer extends BaseSerializer<FileUploadResponseDto> {
  serialize(item: FileUploadResponseDto): any {
    return {
      name: item.name,
      additions: item.additions,
      deletions: item.deletions,
      updates: item.updates,
    };
  }
}
