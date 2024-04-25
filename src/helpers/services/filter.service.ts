import { SelectQueryBuilder } from 'typeorm';
import { getCurrentProcessStatusById } from '../../enum/current-process-status';

export class FilterService {
  static applyFilters(
    queryBuilder: SelectQueryBuilder<any>,
    filters: { [key: string]: any },
  ): void {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        this.applyFilter(queryBuilder, key, value);
      }
    });
  }

  private static applyFilter(
    queryBuilder: SelectQueryBuilder<any>,
    key: string,
    value: any,
  ): void {
    switch (key) {
      case 'status':
        const statusName = getCurrentProcessStatusById(value);
        this.applyEqualFilter(
          queryBuilder,
          'currentProcess.status',
          statusName,
        );
        break;
      case 'currentProcess':
        queryBuilder.andWhere(`currentProcess.name LIKE :currentProcess`, {
          currentProcess: `%${value}%`,
        });
        break;
      case 'spcBranch':
        queryBuilder.andWhere(`associatedSpcs.branchName LIKE :spcBranch`, {
          spcBranch: `%${value}%`,
        });
        break;
      case 'spcBranchOnlyUncategorized':
        const booleanValue: boolean = value === 'true';
        if (booleanValue) {
          queryBuilder.andWhere(
            `(associatedSpcs.branch_name IS NULL OR (SELECT COUNT(*) FROM proc_associated_spc as associated_spc WHERE current_process = currentProcess.id AND associated_spc.deleted_at IS NULL) > 1)`,
          );
        }
        break;
      case 'associatedCurrentProcess':
        queryBuilder.andWhere(
          `associated.name LIKE :associatedCurrentProcess`,
          {
            associatedCurrentProcess: `%${value}%`,
          },
        );
        break;
      case 'associatedSPCProcess':
        queryBuilder.andWhere(`associatedSpcs.name LIKE :associatedSpcs`, {
          associatedSpcs: `%${value}%`,
        });
        break;
      case 'updatedAtFrom':
        this.applyGreaterThanOrEqualFilter(
          queryBuilder,
          'currentProcess.updatedAt',
          value,
        );
        break;
      case 'updatedAtTo':
        this.applyLessThanOrEqualFilter(
          queryBuilder,
          'currentProcess.updatedAt',
          value,
        );
        break;
    }
  }

  private static applyEqualFilter(
    queryBuilder: SelectQueryBuilder<any>,
    field: string,
    value: string,
  ): void {
    queryBuilder.andWhere(`${field} = :equalValue`, {
      equalValue: `${value}`,
    });
  }

  private static applyGreaterThanOrEqualFilter(
    queryBuilder: SelectQueryBuilder<any>,
    field: string,
    value: Date,
  ): void {
    queryBuilder.andWhere(`${field} >= :valueGT`, { valueGT: value });
  }

  private static applyLessThanOrEqualFilter(
    queryBuilder: SelectQueryBuilder<any>,
    field: string,
    value: Date,
  ): void {
    queryBuilder.andWhere(`${field} <= :valueLT`, { valueLT: value });
  }
}
