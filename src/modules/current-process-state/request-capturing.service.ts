import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiOrganizationService } from 'src/api-service/api-organization.service';
import { ApiSurveyService } from 'src/api-service/api-survey.service';
import { RequestPresentationDto } from 'src/api-service/dto/surveys-for-reques-presentation.dto';
import {
  CurrentProcessStateService,
  TreeNode,
} from 'src/modules/current-process-state/current-process-state.service';
import { RequestCapturingDto } from 'src/modules/current-process-state/dto/request-capturing.dto';
import { SelectedFutureProcess } from 'src/modules/selected-future-process/entities/selected-future-process.entity';
import { Repository } from 'typeorm';

interface MapperInfo {
  mapper: string | null;
  name: string | null;
}

@Injectable()
export class RequestCapturingService {
  constructor(
    @InjectRepository(SelectedFutureProcess)
    private selectedFutureProcessRepository: Repository<SelectedFutureProcess>,
    private readonly apiOrganizationService: ApiOrganizationService,
    private readonly apiSurveyService: ApiSurveyService,
    private readonly currentProcessStateService: CurrentProcessStateService,
  ) {}
  async getMappersFromRequestCapturing(
    projectId: string,
    dto: RequestCapturingDto,
  ) {
    const mappers =
      await this.apiOrganizationService.getAllMappersByProject(projectId);
    if (!mappers.length) {
      throw new NotFoundException(`Mappers not found`);
    }
    const currentProcessList =
      await this.currentProcessStateService.getCurrentProcess(projectId);

    const selectedFutureProcessEntity =
      await this.selectedFutureProcessRepository
        .createQueryBuilder('sfp')
        .addSelect(['sfp.*'])
        .addSelect(['spc.*'])
        .leftJoinAndSelect(
          'AssociatedSpc',
          'spc',
          'spc.code = sfp.code AND spc.name = sfp.spcName',
        )
        .andWhere('sfp.id IN (:...processId)', {
          processId: mappers.map((mapper) => mapper.selectedFutureProcess),
        })
        .getRawMany();

    const selectedFutureProcess = selectedFutureProcessEntity.map((item) => {
      const foundMapper = mappers.find(
        (m) => m.selectedFutureProcess === item.sfp_id,
      );
      return {
        mapper: foundMapper ? foundMapper.userId : null,
        sfpId: item.sfp_id,
        currentProcess: item.current_process,
      };
    });
    this.assignMapperRecursive(currentProcessList, selectedFutureProcess);
    const response = [];
    for (const process of dto.processes) {
      const { mapper, name } = this.findMapperForProcess(
        process,
        currentProcessList,
      );
      response.push({ id: process, name, mapper });
    }
    const groupedByMapper = response.reduce((acc, item) => {
      const { mapper, id, name } = item;
      if (!acc[mapper]) {
        acc[mapper] = { userId: mapper, processes: [] };
      }
      acc[mapper].processes.push({ id, name });
      return acc;
    }, {});

    this.validateUserIdNull(groupedByMapper);
    const surveysForRequesPresentation: RequestPresentationDto[] =
      Object.values(groupedByMapper);
    await this.apiSurveyService.sendSurveyForRequestPresentation(
      projectId,
      surveysForRequesPresentation,
    );
  }

  private validateUserIdNull(groupedByMapper: any) {
    let nullUserItem = null;
    for (const userId in groupedByMapper) {
      if (groupedByMapper[userId].userId === null) {
        nullUserItem = groupedByMapper[userId];
        break;
      }
    }
    if (nullUserItem) {
      const nameCurrentProcess = nullUserItem.processes.flatMap(
        (process: any) => process.name,
      );
      throw new NotFoundException(
        `Mappers not found for process ${nameCurrentProcess.join(', ')}`,
      );
    }
  }

  private assignMapperRecursive(processes, selectedFutureProcess) {
    processes.forEach((process) => {
      const foundMapper = selectedFutureProcess.find(
        (sfp) => sfp.currentProcess === process.id,
      );
      process.mapper = foundMapper ? foundMapper.mapper : null;
      if (process.subProcesses && process.subProcesses.length > 0) {
        this.assignMapperRecursive(process.subProcesses, selectedFutureProcess);
      }
    });
  }

  private findMapperForProcess(
    processId: string,
    currentProcessList: TreeNode[],
  ): MapperInfo | null {
    const result = this.findMapperCurrentProcess(processId, currentProcessList);
    if (result) {
      return { mapper: result.mapper, name: result.name };
    } else {
      return null;
    }
  }
  private findMapperCurrentProcess(
    id: string,
    processes: TreeNode[],
    parentMapper: string | null = null,
  ): MapperInfo | null {
    for (const process of processes) {
      if (process.id === id) {
        return {
          mapper: process.mapper === null ? parentMapper : process.mapper,
          name: process.name,
        };
      }
      if (process.subProcesses && process.subProcesses.length > 0) {
        const actualMapper =
          process.mapper === null ? parentMapper : process.mapper;
        const foundInSubProcess = this.findMapperCurrentProcess(
          id,
          process.subProcesses,
          actualMapper,
        );
        if (foundInSubProcess) {
          return foundInSubProcess;
        }
      }
    }
  }
}
