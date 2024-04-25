import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  UseGuards,
  Get,
  Patch,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { PresentationService } from './presentation.service';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PresentationStepsSerializer } from '../../serializers/presentation-steps.serializer';
import { CurrentProcessPresentationDto } from 'src/modules/presentation/dto/current-process-presentation.dto';

@Controller('projects/:projectId/current-process-presentations')
@ApiTags('Current processes presentation')
export class CurrentProcessPresentationController {
  constructor(private presentationProcess: PresentationService) {}

  @Post(':id')
  @ApiBody({ type: [CurrentProcessPresentationDto] })
  @UseGuards(
    new PermissionsGuard([
      'current-process-presentations.fill',
      'client-users.default',
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: CurrentProcessPresentationDto[],
    @Request() req: any,
  ) {
    return await this.presentationProcess.createCurrentProcessStatePresentation(
      projectId,
      id,
      body,
      req.user.email,
    );
  }

  @Get(':id')
  @UseGuards(
    new PermissionsGuard([
      'current-process-presentations.view',
      'client-users.default',
    ]),
  )
  @HttpCode(HttpStatus.OK)
  async findPresentation(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const steps = await this.presentationProcess.findCurrentProcessPresentation(
      projectId,
      id,
    );
    const serializer = new PresentationStepsSerializer();
    return serializer.respond(steps);
  }

  @Patch(':id/status/:status')
  @UseGuards(
    new PermissionsGuard([
      'current-process-presentations.change-status',
      'client-users.default',
    ]),
  )
  changeStatus(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('status') status: string,
  ) {
    return this.presentationProcess.changeStatus(id, status, projectId);
  }

  @Post(':id/reset-process')
  @UseGuards(
    new PermissionsGuard([
      'current-process-presentations.reset',
      'client-users.default',
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async resetCurrentProcess(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return await this.presentationProcess.resetCurrentProcessPresentation(
      projectId,
      id,
      req.user.email,
    );
  }
}
