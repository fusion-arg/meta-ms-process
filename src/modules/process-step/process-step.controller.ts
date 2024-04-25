import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProcessStepService } from './process-step.service';
import { FilterParams } from '../../helpers/decorators/filter.decorator';
import { ProcessStepFilter } from '../../helpers/filters/process-step.filter';
import { CurrentProcessStepSerializer } from '../../serializers/current-process-step.serializer';
import { FutureProcessStepSerializer } from '../../serializers/future-process-step.serializer';
import { ProcessType } from '../../enum/process-type';
import { StepsFilter } from '../../helpers/filters/steps.filter';
import { CurrentProcessStepDetailSerializer } from '../../serializers/current-process-step-detail.serializer';
import { FutureProcessStepDetailSerializer } from '../../serializers/future-process-step-detail.serializer';

@Controller('projects/:projectId/process-steps')
export class ProcessStepController {
  constructor(private processSteps: ProcessStepService) {}

  @Get()
  @UseGuards()
  async findAll(
    @Param('projectId') projectId: string,
    @FilterParams(ProcessStepFilter) filter: ProcessStepFilter,
  ) {
    const steps = await this.processSteps.findAll(projectId, filter);

    let serializer = new CurrentProcessStepSerializer();

    if (filter.type === ProcessType.futureProcessState) {
      serializer = new FutureProcessStepSerializer();
    }

    return serializer.respondMany(steps);
  }

  @Get(':id')
  @UseGuards()
  async findByProcess(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @FilterParams(StepsFilter) filter: StepsFilter,
  ) {
    const process = await this.processSteps.findByProcess(
      projectId,
      id,
      filter,
    );
    let serializer = new CurrentProcessStepDetailSerializer();

    if (filter.type === ProcessType.futureProcessState) {
      serializer = new FutureProcessStepDetailSerializer();
    }

    return serializer.respond(process);
  }
}
