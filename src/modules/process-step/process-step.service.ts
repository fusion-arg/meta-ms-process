import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessStepFilter } from '../../helpers/filters/process-step.filter';
import { FutureProcessState } from '../presentation/entities/future-process-state.entity';
import { ProcessType } from '../../enum/process-type';
import { StepsFilter } from '../../helpers/filters/steps.filter';
import { PresentationService } from '../presentation/presentation.service';
import { CurrentProcessPresentation } from '../presentation/entities/current-process-presentation.entity';

@Injectable()
export class ProcessStepService {
  constructor(
    @InjectRepository(FutureProcessState)
    private futureProcessStateRepository: Repository<FutureProcessState>,
    @InjectRepository(CurrentProcessPresentation)
    private currentProcessPresentationRepository: Repository<CurrentProcessPresentation>,
    private presentationService: PresentationService,
  ) {}

  async findAll(projectId: string, filter: ProcessStepFilter) {
    isValidProcessType(filter);

    let queryBuilder;
    if (filter.type === ProcessType.currentProcessState) {
      queryBuilder = await this.getQueryBuilderCurrentProcess(projectId);
    }

    if (filter.type === ProcessType.futureProcessState) {
      queryBuilder = await this.getQueryBuilderFutureProcess(projectId);
    }
    return queryBuilder.getMany();
  }

  private async getQueryBuilderCurrentProcess(projectId: string) {
    return await this.currentProcessPresentationRepository
      .createQueryBuilder('repo')
      .innerJoinAndSelect('repo.currentProcessState', 'process')
      .leftJoinAndSelect('repo.templates', 'template')
      .innerJoin('repo.currentProcessState', 'cps')
      .where('process.project_id = :projectId', { projectId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .from('proc_current_process_presentation', 'sq')
          .innerJoin('sq.currentProcessState', 'sq_sp')
          .where('sq_sp.id = cps.id')
          .andWhere('sq_sp.project_id = :projectId')
          .select('MAX(sq.created_at)', 'max_created_at')
          .getQuery();
        return 'repo.createdAt = (' + subQuery + ')';
      })
      .orderBy('process.name')
      .addOrderBy('template.step')
      .setParameter('projectId', projectId);
  }

  private async getQueryBuilderFutureProcess(projectId: string) {
    return await this.futureProcessStateRepository
      .createQueryBuilder('repo')
      .innerJoinAndSelect('repo.selectedFutureProcess', 'sfp')
      .leftJoinAndSelect('repo.templates', 'template')
      .innerJoin('repo.selectedFutureProcess', 'sp')
      .where('sfp.project_id = :projectId', { projectId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .from('proc_future_process_state', 'sq')
          .innerJoin('sq.selectedFutureProcess', 'sq_sp')
          .where('sq_sp.id = sp.id')
          .andWhere('sq_sp.project_id = :projectId')
          .select('MAX(sq.created_at)', 'max_created_at')
          .getQuery();
        return 'repo.createdAt = (' + subQuery + ')';
      })
      .orderBy('sfp.futureProcessName')
      .addOrderBy('template.step')
      .setParameter('projectId', projectId);
  }

  async findByProcess(
    projectId: string,
    processId: string,
    filter: StepsFilter,
  ) {
    isValidProcessType(filter);
    let queryBuilder;
    if (filter.type === ProcessType.currentProcessState) {
      queryBuilder = await this.getQueryBuilderCurrentProcess(projectId);
    }
    if (filter.type === ProcessType.futureProcessState) {
      queryBuilder = await this.getQueryBuilderFutureProcess(projectId);
    }
    queryBuilder
      .leftJoinAndSelect('template.file', 'file')
      .andWhere('repo.id = :processId', { processId });
    const process = await queryBuilder.getOne();

    if (!process) {
      throw new NotFoundException('Process not found');
    }
    const stepStart = this.findStep(process, filter.startStep);
    const stepEnd = this.findStep(process, filter.endStep);
    if (filter.endStep) {
      process.templates = process.templates.filter(
        (template) => template.step >= stepStart && template.step <= stepEnd,
      );
    } else {
      process.templates = process.templates.filter(
        (template) => template.step >= stepStart,
      );
    }
    const steps =
      await this.presentationService.mapTemplatesToPresentationItems(
        process.templates,
      );

    return { ...process, steps };
  }

  private findStep(process: any, filter: string) {
    let foundStep = null;

    const template = process.templates.find(
      (template: any) => template.id === filter,
    );
    if (template) {
      foundStep = template.step;
    }

    return foundStep;
  }
}
function isValidProcessType(filter: ProcessStepFilter) {
  if (
    filter.type !== ProcessType.currentProcessState &&
    filter.type !== ProcessType.futureProcessState
  )
    throw new BadRequestException('Invalid type provided');
}
