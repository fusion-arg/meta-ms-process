import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SelectedFutureProcessData } from '../../data/selected-future-process.data';
import {
  SelectedFutureProcessStatus,
  getFutureProcessStatusById,
} from '../../enum/selected-future-process-status';
import { PaginationService } from '../../helpers/services/pagination.service';
import { SelectedFutureProcess } from './entities/selected-future-process.entity';
import { v4 as uuidv4 } from 'uuid';
import { Pagination } from '../../contracts/pagination.contract';
import { SelectedFutureProcessSorting } from '../../helpers/sortings/selected-future-process.sorting';
import { SelectedFutureProcessFilter } from '../../helpers/filters/selected-future-process.filter';
import { ApiOrganizationService } from 'src/api-service/api-organization.service';

interface PathInfo {
  code: string;
  name: string;
}

@Injectable()
export class SelectedFutureProcessService extends PaginationService {
  constructor(
    @InjectRepository(SelectedFutureProcess)
    private selectedFutureProcessRepository: Repository<SelectedFutureProcess>,
    private readonly apiOrganizationService: ApiOrganizationService,
  ) {
    super();
  }

  async findOne(processId: string, projectId: string): Promise<any> {
    const futureProcess = await this.selectedFutureProcessRepository.findOne({
      where: { id: processId, projectId: projectId },
      relations: ['parent', 'children'],
    });
    if (!futureProcess)
      throw new NotFoundException(`Selected Future Process not found`);

    return futureProcess;
  }

  async filter(
    projectId: string,
    filter: SelectedFutureProcessFilter,
    sorting: SelectedFutureProcessSorting,
    pagination: Pagination,
  ): Promise<any> {
    const queryBuilder = this.selectedFutureProcessRepository
      .createQueryBuilder('selectedFutureProcess')
      .leftJoinAndSelect('selectedFutureProcess.parent', 'parent')
      .leftJoinAndSelect('selectedFutureProcess.children', 'children')
      .where('selectedFutureProcess.project_id = :id', { id: projectId });

    if (filter.processBranch) {
      const selectedFutureProcess = await this.findSelectedFutureProcess(
        projectId,
        filter.processBranch,
      );
      queryBuilder.andWhere(
        'selectedFutureProcess.parent_id = :selectedParent',
        {
          selectedParent: selectedFutureProcess.id,
        },
      );
    } else {
      queryBuilder.andWhere('selectedFutureProcess.parent_id IS NULL');
    }
    if (filter.status) {
      const statusName = getFutureProcessStatusById(filter.status);
      queryBuilder.andWhere('selectedFutureProcess.status = :status', {
        status: statusName,
      });
    }
    this.applySorting(queryBuilder, sorting);
    return await this.paginate(queryBuilder, pagination);
  }
  private async findSelectedFutureProcess(
    projectId: string,
    processBranch: string,
  ): Promise<SelectedFutureProcess> {
    const selectedFutureProcess =
      await this.selectedFutureProcessRepository.findOne({
        where: { projectId, visibleCode: processBranch },
      });

    if (!selectedFutureProcess) {
      throw new NotFoundException(`Selected Future Process not found`);
    }

    return selectedFutureProcess;
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<any>,
    sorting: SelectedFutureProcessSorting,
  ): void {
    const { status } = sorting;

    if (status) {
      queryBuilder.addOrderBy('selectedFutureProcess.status', status);
    }
  }

  async getPath(
    projectId: string,
    filter: SelectedFutureProcessFilter,
  ): Promise<any> {
    return await this.getPathRecursive(projectId, filter.processBranch);
  }
  private async getPathRecursive(
    projectId: string,
    visibleCode: string,
  ): Promise<PathInfo[]> {
    const queryBuilder = this.selectedFutureProcessRepository
      .createQueryBuilder('selectedFutureProcess')
      .leftJoinAndSelect('selectedFutureProcess.parent', 'parent')
      .where('selectedFutureProcess.project_id = :id', { id: projectId })
      .andWhere('selectedFutureProcess.visible_code = :visibleCode', {
        visibleCode,
      });

    const selectedFutureProcess = await queryBuilder.getOne();

    if (!selectedFutureProcess) {
      return [];
    }

    const pathInfo: PathInfo = {
      code: selectedFutureProcess.visibleCode,
      name: selectedFutureProcess.spcName,
    };

    if (selectedFutureProcess.parent) {
      const parentPath = await this.getPathRecursive(
        projectId,
        selectedFutureProcess.parent.visibleCode,
      );
      return [...parentPath, pathInfo];
    }
    return [pathInfo];
  }

  async create(
    selectedFutureProcesses: SelectedFutureProcessData[],
  ): Promise<void> {
    try {
      await this.selectedFutureProcessRepository.manager.transaction(
        async (manager) => {
          const repository = manager.getRepository(SelectedFutureProcess);
          const selectedItems = selectedFutureProcesses.filter(
            (item) => item.isSelected,
          );
          await this.processSelectedItems(selectedItems, repository);

          const unselectedItems = selectedFutureProcesses.filter(
            (item) => !item.isSelected,
          );
          await this.deleteUnselectedItems(unselectedItems, repository);
        },
      );
    } catch (error) {
      Logger.error(error, 'Error -> create selectedFutureProcess');
      throw new BadRequestException(error);
    }
  }

  private async processSelectedItems(
    selectedItems: SelectedFutureProcessData[],
    repository: Repository<SelectedFutureProcess>,
  ): Promise<void> {
    for (const item of selectedItems) {
      const existingSelectadFutureProcess = await repository.findOne({
        where: { futureProcessId: item.futureProcessId },
      });

      if (existingSelectadFutureProcess) {
        await this.updateSelectedFutureProcess(
          existingSelectadFutureProcess,
          item,
          repository,
        );
      } else {
        await this.createSelectadFutureProcess(item, repository);
      }
    }
  }

  private async deleteUnselectedItems(
    unselectedItems: SelectedFutureProcessData[],
    repository: Repository<SelectedFutureProcess>,
  ): Promise<void> {
    const unselectedItemsIds = unselectedItems.map(
      (item) => item.futureProcessId,
    );

    if (unselectedItemsIds.length > 0) {
      const itemsDeleted = await repository
        .createQueryBuilder()
        .where('future_process_id IN (:...ids)', { ids: unselectedItemsIds })
        .getMany();
      await repository.softRemove(itemsDeleted);
    }
  }

  private async updateSelectedFutureProcess(
    existingRecord: SelectedFutureProcess,
    item: SelectedFutureProcessData,
    repository: Repository<SelectedFutureProcess>,
  ): Promise<void> {
    Object.assign(existingRecord, {
      spcName: item.spcName,
      futureProcessName: item.futureProcessName,
      code: item.code,
      projectId: item.projectId,
      visibleCode: item.visibleCode,
      status: SelectedFutureProcessStatus.NotStarted,
    });

    await repository.save(existingRecord);
  }

  private async createSelectadFutureProcess(
    item: SelectedFutureProcessData,
    repository: Repository<SelectedFutureProcess>,
  ): Promise<void> {
    const parentEntity = item.parent
      ? await repository.findOne({
          where: {
            projectId: item.projectId,
            futureProcessId: item.parent,
          },
        })
      : null;

    const selectFutureProcess = repository.create({
      id: uuidv4(),
      futureProcessId: item.futureProcessId,
      spcName: item.spcName,
      futureProcessName: item.futureProcessName,
      code: item.code,
      parent: parentEntity,
      projectId: item.projectId,
      visibleCode: item.visibleCode,
      status: SelectedFutureProcessStatus.NotStarted,
    });

    await repository.save(selectFutureProcess);
  }

  async changeStatus(id: string, status: string, projectId: string) {
    const newStatus = getFutureProcessStatusById(status);
    if (!newStatus) {
      throw new BadRequestException('Invalid status');
    }

    const selectedFutureProcess =
      await this.selectedFutureProcessRepository.findOne({
        where: { id, projectId },
      });

    if (!selectedFutureProcess) {
      throw new NotFoundException('Process not found');
    }

    // TODO: Status flow validation
    Object.assign(selectedFutureProcess, {
      status: newStatus,
    });

    return this.selectedFutureProcessRepository.save(selectedFutureProcess);
  }

  async updateSprint(projectId: string, processId: string, sprintId: string) {
    const sprint = await this.getSprint(sprintId);
    const selectedProceess = await this.findOne(processId, projectId);
    selectedProceess.sprintId = sprint.id;
    return await this.selectedFutureProcessRepository.save(selectedProceess);
  }

  private async getSprint(sprintId: string) {
    const sprint = await this.apiOrganizationService.getSprint(sprintId);
    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }
    return sprint;
  }
}
