import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationService } from '../../helpers/services/pagination.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectedFutureProcess } from '../selected-future-process/entities/selected-future-process.entity';
import { IsNull, Repository } from 'typeorm';
import { FileUploadResponseDto } from './dto/file-upload-response.dto';
import {
  ProcessMappingDto,
  ProcessMappingItem,
} from './dto/process-mapping.dto';
import { ProcessMappingValidateFileService } from './process-mapping-validate-file.service';
import { ProcessMappingStatus } from '../../enum/process-mapping-status';
import { ApiOrganizationService } from '../../api-service/api-organization.service';
import { Pagination } from '../../contracts/pagination.contract';
import { ProcessMappingFilter } from '../../helpers/filters/process-mapping.filter';

interface PathInfo {
  code: string;
  name: string;
}

@Injectable()
export class ProcessMappingService extends PaginationService {
  constructor(
    @InjectRepository(SelectedFutureProcess)
    private selectedFutureProcessRepository: Repository<SelectedFutureProcess>,
    @Inject(ProcessMappingValidateFileService)
    private processMappingValidateService: ProcessMappingValidateFileService,
    private readonly apiOrganizationService: ApiOrganizationService,
  ) {
    super();
  }

  async filter(
    projectId: string,
    filter: ProcessMappingFilter,
    pagination: Pagination,
    token: string,
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

    const response = await this.paginate(queryBuilder, pagination);

    const departmentIds = response.items
      .filter((item) => item.departmentId !== null)
      .map((item) => item.departmentId);

    const { data: departments } =
      await this.apiOrganizationService.getDepartments(
        departmentIds,
        projectId,
        token,
      );

    response.items.forEach((item) => {
      if (item.departmentId !== null) {
        const department = departments.find(
          (dep) => dep.id === item.departmentId,
        );
        if (department) {
          item['department'] = {
            id: department.id,
            name: department.name,
          };
        }
      }
    });

    return response;
  }

  async findOne(
    processId: string,
    projectId: string,
    token: string,
  ): Promise<any> {
    const futureProcess = await this.selectedFutureProcessRepository.findOne({
      where: { id: processId, projectId: projectId },
      relations: ['parent', 'children'],
    });
    if (!futureProcess)
      throw new NotFoundException(`Selected Future Process not found`);

    futureProcess['department'] = null;

    if (futureProcess.departmentId) {
      const {
        data: [department],
      } = await this.apiOrganizationService.getDepartments(
        [futureProcess.departmentId],
        projectId,
        token,
      );

      futureProcess['department'] = {
        id: department.id,
        code: department.code,
        name: department.name,
        parent: department.parent
          ? {
              id: department.parent.id,
              code: department.parent.code,
              name: department.parent.name,
            }
          : null,
        subDepartments: department.children ? department.children : [],
        manager: department.manager,
      };
    }

    return futureProcess;
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

  async getPath(projectId: string, filter: ProcessMappingFilter): Promise<any> {
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

  async processMappingCreate(
    token: string,
    projectId: string,
    processMappingFileDto: ProcessMappingDto,
  ): Promise<FileUploadResponseDto> {
    await this.processMappingValidateService.validateFile(
      token,
      projectId,
      processMappingFileDto,
    );

    if (processMappingFileDto.hasErrors) {
      const errorsFileResponse = {
        message: processMappingFileDto.items.map(({ row, errors }) => ({
          row,
          errors,
        })),
      };
      throw new BadRequestException(errorsFileResponse);
    }
    await this.handleUpdates(projectId, processMappingFileDto.items);
    await this.updateNotMappedStatus(projectId);
    const responseDto: FileUploadResponseDto = {
      name: processMappingFileDto.file,
      updates: processMappingFileDto.items.length,
      additions: 0,
      deletions: 0,
    };
    return responseDto;
  }

  async handleUpdates(
    projectId: string,
    items: ProcessMappingItem[],
  ): Promise<void> {
    for (const item of items) {
      await this.selectedFutureProcessRepository.update(
        { projectId, visibleCode: item.branchCode, deletedAt: IsNull() },
        {
          departmentId: item.deparmentId,
          mappedStatus: ProcessMappingStatus.directlyMapped,
        },
      );
    }
  }

  private async updateNotMappedStatus(projectId: string): Promise<void> {
    this.selectedFutureProcessRepository.update(
      { projectId, departmentId: IsNull() },
      {
        mappedStatus: ProcessMappingStatus.notMapped,
      },
    );
  }
}
