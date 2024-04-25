import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { FutureProcessStatusList } from '../../enum/selected-future-process-status';
import { ReviewStatusSerializer } from '../../serializers/review-status.serializer';
import { CurrentProcessStatusList } from '../../enum/current-process-status';

@Controller()
@ApiTags('Status')
export class ReviewStatusController {
  @Get('selected-future-process/status')
  @UseGuards(
    new PermissionsGuard([
      'selected-future-processes.list',
      'client-users.default',
    ]),
  )
  async findFutureProcessStatus(): Promise<any> {
    const serializer = new ReviewStatusSerializer();
    return serializer.respondMany(FutureProcessStatusList);
  }

  @Get('current-processes/status')
  @UseGuards(
    new PermissionsGuard(['current-processes.list', 'client-users.default']),
  )
  async findCurrentProcessStatus(): Promise<any> {
    const serializer = new ReviewStatusSerializer();
    return serializer.respondMany(CurrentProcessStatusList);
  }
}
