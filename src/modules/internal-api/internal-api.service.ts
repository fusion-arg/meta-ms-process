import { Injectable } from '@nestjs/common';
import { ProcessForTextBlockDto } from './dto/process-for-text-block.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TemplateBlock } from '../presentation/entities/template-block.entity';

@Injectable()
export class InternalApiService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async processesForTextBlocks(data: ProcessForTextBlockDto) {
    const response = [];
    const items = await this.entityManager
      .getRepository(TemplateBlock)
      .createQueryBuilder('tb')
      .leftJoinAndSelect('tb.futureProcessState', 'fps')
      .leftJoinAndSelect('fps.selectedFutureProcess', 'sfp')
      .leftJoinAndSelect('tb.currentProcessPresentation', 'cps')
      .whereInIds(data.referenceIds)
      .getMany();

    for (const item of items) {
      response.push({
        id: item.id,
        name: item.currentProcessPresentation
          ? item.currentProcessPresentation.currentProcessState.name
          : item.futureProcessState.selectedFutureProcess.futureProcessName,
        type: 'presentation_step',
        module: item.currentProcessPresentation
          ? 'current_state_process'
          : 'future_state_process',
        processId: item.currentProcessPresentation
          ? item.currentProcessPresentation.currentProcessState.id
          : item.futureProcessState.selectedFutureProcess.id,
        stepNumber: item.step,
      });
    }

    return response;
  }
}
