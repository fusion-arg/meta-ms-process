import {
  Controller,
  Get,
  UseGuards,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { SelectedFutureProcessData } from '../../data/selected-future-process.data';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { SelectedFutureProcessService } from './selected-future-process.service';
import { Pagination } from '../../contracts/pagination.contract';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { SelectedFutureProcessFilter } from '../../helpers/filters/selected-future-process.filter';
import { SelectedFutureProcessSorting } from '../../helpers/sortings/selected-future-process.sorting';
import { SelectedFutureProcessDetailSerializer } from '../../serializers/selected-future-process-detail.serializer';
import { SelectedFutureProcessSerializer } from '../../serializers/selected-future-process.serializer';

@Controller('projects/:projectId/selected-future-process')
@ApiTags('Selected future process')
export class SelectedFutureProcessController {
  constructor(private selectedFutureProcess: SelectedFutureProcessService) {}

  @Get()
  @UseGuards(
    new PermissionsGuard([
      'selected-future-processes.list',
      'client-users.default',
    ]),
  )
  async findAll(
    @FilterParams(SelectedFutureProcessFilter)
    filter: SelectedFutureProcessFilter,
    @SortingParams(SelectedFutureProcessSorting)
    sorting: SelectedFutureProcessSorting,
    @PaginationParams() paginationParams: Pagination,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    const { items, pagination } = await this.selectedFutureProcess.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const pathInfo = await this.selectedFutureProcess.getPath(
      projectId,
      filter,
    );

    const serializer = new SelectedFutureProcessSerializer();
    const serializedData = serializer.respondManyWithPath(
      items,
      pathInfo,
      pagination,
    );

    return serializedData;
  }

  @Get(':id')
  @UseGuards(
    new PermissionsGuard([
      'selected-future-processes.view',
      'client-users.default',
    ]),
  )
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<any> {
    const item = await this.selectedFutureProcess.findOne(id, projectId);
    const serializer = new SelectedFutureProcessDetailSerializer();

    return serializer.respond(item);
  }

  @Post()
  @ApiBody({ type: [SelectedFutureProcessData] })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: SelectedFutureProcessData[]) {
    return await this.selectedFutureProcess.create(body);
  }

  @Patch(':id/sprint/:sprintId')
  @HttpCode(HttpStatus.OK)
  async updateSprint(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('sprintId') sprintId: string,
  ) {
    return await this.selectedFutureProcess.updateSprint(
      projectId,
      id,
      sprintId,
    );
  }
}
