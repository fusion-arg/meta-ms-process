import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  UseGuards,
  Get,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { PresentationService } from './presentation.service';
import { PresentationDto } from './dto/presentation.dto';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { PresentationStepsSerializer } from '../../serializers/presentation-steps.serializer';
import { SelectedFutureProcessService } from '../selected-future-process/selected-future-process.service';

@Controller('projects/:projectId/future-process-presentations')
@ApiTags('future process presentation')
export class FutureProcessPresentationController {
  constructor(
    private presentationProcess: PresentationService,
    private selectedFutureProcess: SelectedFutureProcessService,
  ) {}

  @Patch(':id/status/:status')
  @UseGuards(
    new PermissionsGuard([
      'future-process-presentations.change-status',
      'client-users.default',
    ]),
  )
  changeStatus(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('status') status: string,
  ) {
    // TODO: validate meta user access to the project by projectId
    return this.selectedFutureProcess.changeStatus(id, status, projectId);
  }

  @Post(':id')
  @ApiBody({ type: [PresentationDto] })
  @UseGuards(
    new PermissionsGuard([
      'future-process-presentations.fill',
      'client-users.default',
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: PresentationDto[],
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return await this.presentationProcess.createFutureProcessPresentation(
      projectId,
      id,
      body,
      token,
      req.user.email,
    );
  }

  @Get(':id')
  @UseGuards(
    new PermissionsGuard([
      'future-process-presentations.view',
      'client-users.default',
    ]),
  )
  @HttpCode(HttpStatus.OK)
  async findPresentation(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const steps = await this.presentationProcess.findFutureProcessPresentation(
      projectId,
      id,
    );
    const serializer = new PresentationStepsSerializer();
    return serializer.respond(steps);
  }

  @Post(':id/reset-process')
  @UseGuards(
    new PermissionsGuard([
      'future-process-presentations.reset',
      'client-users.default',
    ]),
  )
  @HttpCode(HttpStatus.CREATED)
  async resetFutureProcess(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return await this.presentationProcess.resetFutureProcessPresentation(
      projectId,
      id,
      req.user.email,
    );
  }
}
