import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProcessMappingService } from './process-mapping.service';
import { ProcessMappingUploadFileService } from './process-mapping-upload-file.service';
import { ProcessMappingDto } from './dto/process-mapping.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileSerializer } from '../../serializers/upload-file.serializer';
import { Pagination } from '../../contracts/pagination.contract';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { ProcessMappingFilter } from '../../helpers/filters/process-mapping.filter';
import { ProcessMappingDetailSerializer } from '../../serializers/process-mapping-detail.serializer';
import { ProcessMappingListSerializer } from '../../serializers/process-mapping-list.serializer';
import { PermissionsGuard } from '../../guards/permissions.guard';

@Controller('projects/:projectId/process-mappings')
export class ProcessMappingController {
  constructor(
    private processMappings: ProcessMappingService,
    private processMappingUploadFileService: ProcessMappingUploadFileService,
  ) {}

  @Get()
  @UseGuards(
    new PermissionsGuard(['process-mappings.list', 'client-users.default']),
  )
  async findAll(
    @FilterParams(ProcessMappingFilter)
    filter: ProcessMappingFilter,
    @PaginationParams() paginationParams: Pagination,
    @Param('projectId') projectId: string,
    @Req() req: any,
  ): Promise<any> {
    const token = req.headers.authorization?.split(' ')[1];
    const { items, pagination } = await this.processMappings.filter(
      projectId,
      filter,
      paginationParams,
      token,
    );
    const pathInfo = await this.processMappings.getPath(projectId, filter);

    const serializer = new ProcessMappingListSerializer();
    const serializedData = serializer.respondManyWithPath(
      items,
      pathInfo,
      pagination,
    );

    return serializedData;
  }

  @Get(':id')
  @UseGuards(
    new PermissionsGuard(['process-mappings.view', 'client-users.default']),
  )
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<any> {
    const token = req.headers.authorization?.split(' ')[1];
    const item = await this.processMappings.findOne(id, projectId, token);
    const serializer = new ProcessMappingDetailSerializer();

    return serializer.respond(item);
  }

  @Post()
  @UseGuards(new PermissionsGuard(['process-mappings.upload']))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadCsvFile(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    const processMappings: ProcessMappingDto =
      await this.processMappingUploadFileService.processFile(file);

    const response = await this.processMappings.processMappingCreate(
      token,
      projectId,
      processMappings,
    );

    const serializer = new UploadFileSerializer();

    return serializer.respond(response);
  }
}
