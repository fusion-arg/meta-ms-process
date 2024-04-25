import { Injectable } from '@nestjs/common';
import {
  CountMap,
  ProcessMappingDto,
  ProcessMappingItem,
} from './dto/process-mapping.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedFutureProcess } from '../selected-future-process/entities/selected-future-process.entity';
import { ApiOrganizationService } from '../../api-service/api-organization.service';
import { isNumber } from '../../utils/validate';

@Injectable()
export class ProcessMappingValidateFileService {
  constructor(
    @InjectRepository(SelectedFutureProcess)
    private selectedFutureProcessRepository: Repository<SelectedFutureProcess>,
    private readonly apiOrganizationService: ApiOrganizationService,
  ) {}

  async validateFile(
    token: string,
    projectId: string,
    fileDto: ProcessMappingDto,
  ): Promise<void> {
    const countBranchCode = this.getCountMap(fileDto.branchCodes);
    const countDeparments = this.getCountMap(fileDto.departmentCodes);
    const departments =
      await this.apiOrganizationService.getAllDepartmentsByProject(
        token,
        projectId,
      );

    for (const item of fileDto.items) {
      await this.validateItems(
        projectId,
        item,
        countBranchCode,
        countDeparments,
        departments,
      );
    }
    if (fileDto.items.some((item) => item.errors.length > 0)) {
      fileDto.hasErrors = true;
    }
  }

  getCountMap(arr: string[]): CountMap {
    return arr.reduce((countMap: CountMap, item) => {
      countMap[item] = (countMap[item] || 0) + 1;
      return countMap;
    }, {});
  }

  private async validateItems(
    projectId: string,
    item: ProcessMappingItem,
    countNames: CountMap,
    countCodes: CountMap,
    departments: any,
  ) {
    await this.validateBranchCode(projectId, item, countNames);
    await this.validateDepartment(item, countCodes, departments);
  }

  private async validateBranchCode(
    projectId: string,
    item: ProcessMappingItem,
    countNames: CountMap,
  ) {
    const selectedFutureProcess =
      await this.selectedFutureProcessRepository.findOne({
        where: { projectId, visibleCode: item.branchCode },
      });

    if (countNames[item.branchCode] > 1) {
      item.errors.push(`Invalid column 'processId', duplicated in this file.`);
    }
    if (!selectedFutureProcess) {
      item.errors.push(
        `Invalid column 'processId', cannot be found in database.`,
      );
    }
  }

  private async validateDepartment(
    item: ProcessMappingItem,
    countCodes: CountMap,
    departments: any,
  ) {
    if (item.deparmentCode === '') return;

    if (countCodes[item.deparmentCode] > 1) {
      item.errors.push(
        `Invalid column 'departmentId', duplicated in this file.`,
      );
    }
    if (!isNumber(item.deparmentCode)) {
      item.errors.push(`Invalid column 'departmentId', must be numeric.`);
    }
    const departamentExisting = departments.filter(
      (d) => d.code === parseInt(item.deparmentCode),
    );
    const department = departamentExisting[0];
    if (!department) {
      item.errors.push(
        `Invalid column 'departmentId', cannot be found in database.`,
      );
    } else {
      item.deparmentId = department.id;
    }
  }
}
