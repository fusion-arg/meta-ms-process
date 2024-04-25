import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentProcessStateService } from './current-process-state.service';
import { CreateCurrentProcessStateDto } from './dto/create-current-process-state.dto';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { SortingParams } from '../../helpers/decorators/sorting.decorator';
import { PaginationParams } from '../../helpers/decorators/pagination.decorator';
import { Pagination } from '../../contracts/pagination.contract';
import { CurrentProcessSorting } from '../../helpers/sortings/current-process.sorting';
import { CurrentProcessFilter } from '../../helpers/filters/current-process.filter';
import { CurrentProcessSerializer } from '../../serializers/current-process/current-process.serializer';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { UpdateCurrentProcessStateDto } from './dto/update-current-process-state.dto';
import { CurrentProcessRequestCapturingSerializer } from 'src/serializers/current-process/current-process-request-capturing.serializer';
import { RequestCapturingDto } from 'src/modules/current-process-state/dto/request-capturing.dto';
import { RequestCapturingService } from 'src/modules/current-process-state/request-capturing.service';

@Controller('projects/:projectId/current-processes')
@ApiTags('Current processes')
export class CurrentProcessStateController {
  constructor(
    private readonly currentProcessStateService: CurrentProcessStateService,
    private readonly requestCapturingService: RequestCapturingService,
  ) {}

  @Post()
  @UseGuards(
    new PermissionsGuard(['current-processes.create', 'client-users.default']),
  )
  @ApiBody({ type: CreateCurrentProcessStateDto })
  async create(
    @Param('projectId') projectId: string,
    @Body() createCurrentProcessStateDto: CreateCurrentProcessStateDto,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    const item = await this.currentProcessStateService.create(
      projectId,
      createCurrentProcessStateDto,
      token,
      req.user.email,
    );
    const serializer = new CurrentProcessSerializer();
    return serializer.respond(item);
  }

  @Get()
  @UseGuards(
    new PermissionsGuard(['current-processes.list', 'client-users.default']),
  )
  async findAll(
    @FilterParams(CurrentProcessFilter)
    filter: CurrentProcessFilter,
    @SortingParams(CurrentProcessSorting)
    sorting: CurrentProcessSorting,
    @PaginationParams() paginationParams: Pagination,
    @Param('projectId') projectId: string,
  ): Promise<any> {
    const { items, pagination } = await this.currentProcessStateService.filter(
      projectId,
      filter,
      sorting,
      paginationParams,
    );
    const serializer = new CurrentProcessSerializer();
    return serializer.respondMany(items, pagination);
  }

  @Put(':id')
  @UseGuards(
    new PermissionsGuard(['current-processes.update', 'client-users.default']),
  )
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateCurrentProcessStateDto })
  async update(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body() body: UpdateCurrentProcessStateDto,
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    const item = await this.currentProcessStateService.update(
      id,
      body,
      projectId,
      token,
    );
    const serializer = new CurrentProcessSerializer();
    return serializer.respond(item);
  }

  @Get('request-capturing')
  async findAllCurrentProcessForRequestCapturing(
    @Param('projectId') projectId: string,
  ): Promise<any> {
    const items =
      await this.currentProcessStateService.findCurrentProcessForRequestCapturing(
        projectId,
      );
    const serializer = new CurrentProcessRequestCapturingSerializer();
    return serializer.respond(items);
  }

  @Get(':id')
  @UseGuards(
    new PermissionsGuard(['current-processes.view', 'client-users.default']),
  )
  async findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const item = await this.currentProcessStateService.findOne(projectId, id);
    const serializer = new CurrentProcessSerializer();
    return serializer.respond(item);
  }

  @Delete(':id')
  @UseGuards(
    new PermissionsGuard(['current-processes.delete', 'client-users.default']),
  )
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('projectId') projectId: string, @Param('id') id: string) {
    return await this.currentProcessStateService.remove(id, projectId);
  }

  @Post('request-capturing')
  async sendRequestCapturing(
    @Param('projectId') projectId: string,
    @Body() dto: RequestCapturingDto,
  ): Promise<any> {
    return await this.requestCapturingService.getMappersFromRequestCapturing(
      projectId,
      dto,
    );
  }
}
