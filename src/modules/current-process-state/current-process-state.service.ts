import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CurrentProcessFilter } from '../../helpers/filters/current-process.filter';
import { CurrentProcessSorting } from '../../helpers/sortings/current-process.sorting';
import { Pagination } from '../../contracts/pagination.contract';
import { EntityManager, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationService } from '../../helpers/services/pagination.service';
import { FilterService } from '../../helpers/services/filter.service';
import { CreateCurrentProcessStateDto } from './dto/create-current-process-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentProcessState } from './entities/current-process-state.entity';
import { ApiProjectService } from '../../api-service/api-project.service';
import { AssociatedProcess } from './entities/associated-process.entity';
import { AssociatedSpc } from './entities/associated-spc.entity';
import { UpdateCurrentProcessStateDto } from './dto/update-current-process-state.dto';
import { TemplateBlock } from '../presentation/entities/template-block.entity';
import { TextTemplateBlock } from '../presentation/entities/text-template-block.entity';
import { ImageTemplateBlock } from '../presentation/entities/image-template-block.entity';
import { FileStorage } from '../file-storage/entities/file-storage.entity';
import { CurrentProcessPresentation } from '../presentation/entities/current-process-presentation.entity';
import { CurrentProcessStatus } from 'src/enum/current-process-status';

export class TreeNode {
  id: string;
  name: string;
  subProcesses?: TreeNode[];
  presentationId: string;
  mapper?: string;
}

@Injectable()
export class CurrentProcessStateService extends PaginationService {
  constructor(
    @InjectRepository(CurrentProcessState)
    private currentRepository: Repository<CurrentProcessState>,
    @InjectRepository(AssociatedProcess)
    private associatedRepository: Repository<AssociatedProcess>,
    @InjectRepository(AssociatedSpc)
    private spcRepository: Repository<AssociatedSpc>,
    @InjectRepository(TemplateBlock)
    private templateBlockRepository: Repository<TemplateBlock>,
    @InjectRepository(CurrentProcessPresentation)
    private currentProcessPresentationRepository: Repository<CurrentProcessPresentation>,
    private readonly apiProjectService: ApiProjectService,
  ) {
    super();
  }

  async create(
    projectId: string,
    createCurrentProcess: CreateCurrentProcessStateDto,
    token: string,
    createdBy: string,
  ) {
    let templateBlockToClone: TemplateBlock[];
    if (createCurrentProcess.cloneId) {
      templateBlockToClone = await this.findTemplateBlockToClone(
        projectId,
        createCurrentProcess.cloneId,
      );
    }
    await this.validateCurrentProcessName(createCurrentProcess.name, projectId);
    const validateSpc = await this.validateSpc(
      token,
      createCurrentProcess.spcsId,
    );
    let newCurrentProcess: CurrentProcessState;
    try {
      await this.currentRepository.manager.transaction(async (manager) => {
        newCurrentProcess = await this.createOrUpdateCurrentProcess(
          createCurrentProcess,
          projectId,
          manager,
        );

        if (createCurrentProcess.associatesId) {
          const associatedProcess: CurrentProcessState =
            await this.currentRepository.findOneBy({
              id: createCurrentProcess.associatesId,
              projectId: projectId,
            });
          if (!associatedProcess)
            throw new NotFoundException(
              `Associated Process with ID ${createCurrentProcess.associatesId} not found`,
            );
          await this.createAssociatedProcess(
            newCurrentProcess,
            associatedProcess,
            manager,
          );
        }

        await this.createAssociatedSpc(newCurrentProcess, validateSpc, manager);
        if (templateBlockToClone) {
          const newPresentation =
            this.currentProcessPresentationRepository.create({
              createdBy,
              currentProcessState: newCurrentProcess,
            });

          const currentProcessPresentation = await manager.save(
            CurrentProcessPresentation,
            newPresentation,
          );
          await this.cloneTemplateBlock(
            templateBlockToClone,
            currentProcessPresentation,
            manager,
          );
        }
      });

      const queryBuilder = this.findCurrentProcessbyProject(projectId);
      return queryBuilder.andWhere({ id: newCurrentProcess.id }).getOne();
    } catch (error) {
      Logger.error(error, 'Error -> create Current Process');
      throw new BadRequestException(error);
    }
  }

  async findTemplateBlockToClone(
    projectId: string,
    cloneId: string,
  ): Promise<TemplateBlock[]> {
    const cloneCurrentProcess = await this.currentRepository.findOneBy({
      id: cloneId,
      projectId,
    });

    if (!cloneCurrentProcess)
      throw new NotFoundException(
        `Clone Current Process with ID ${cloneId} not found for Project`,
      );

    const latestProcess =
      await this.currentProcessPresentationRepository.findOne({
        where: { currentProcessState: { id: cloneCurrentProcess.id } },
        order: { createdAt: 'DESC' },
      });
    if (!latestProcess) return null;

    const templateBlock = await this.templateBlockRepository.find({
      where: {
        currentProcessPresentation: { id: latestProcess.id },
      },
      relations: ['file'],
    });
    return templateBlock;
  }

  async cloneTemplateBlock(
    templateBlockToClone: TemplateBlock[],
    currentProcessPresentation: CurrentProcessPresentation,
    queryRunner: EntityManager,
  ) {
    for (const blockToClone of templateBlockToClone) {
      let newBlock;
      if (blockToClone instanceof TextTemplateBlock) {
        newBlock = new TextTemplateBlock();
        newBlock.description = blockToClone.description;
      } else if (blockToClone instanceof ImageTemplateBlock) {
        newBlock = new ImageTemplateBlock();
        const clonedFile = new FileStorage();
        clonedFile.filename = blockToClone.file.filename;
        clonedFile.bucketName = blockToClone.file.bucketName;
        const savedFile = await queryRunner.save(FileStorage, clonedFile);
        newBlock.file = savedFile;
        newBlock.imageData = blockToClone.imageData;
      } else {
        newBlock = new TemplateBlock();
      }
      newBlock.step = blockToClone.step;
      newBlock.title = blockToClone.title;
      newBlock.comments = blockToClone.comments;
      newBlock.currentProcessPresentation = currentProcessPresentation;
      newBlock.referenceId = blockToClone;
      await queryRunner.save(newBlock);
    }
  }

  async validateCurrentProcessName(
    nameCurrentProcess: string,
    projectId: string,
    id?: string,
  ) {
    const currentProcessExist = await this.currentRepository.findOneBy({
      name: nameCurrentProcess,
      projectId: projectId,
      ...(id && { id: Not(id) }),
    });
    if (currentProcessExist)
      throw new ConflictException('The name is already in use');
  }

  async validateSpc(token: string, spcsAssociated: string) {
    const spcs = await this.apiProjectService.getAllSpcs(token);
    const foundSpc = spcs.data.find((spc) => spc.id === spcsAssociated);
    if (!foundSpc) {
      throw new NotFoundException(`SPC with ID ${spcsAssociated} not found`);
    }
    const branchCode = foundSpc.visibleCode.split('.')[0];
    const branch = spcs.data.find(
      (spc) => parseInt(spc.code, 10) === parseInt(branchCode, 10),
    );
    const branchName = branch ? branch.name : null;
    return { ...foundSpc, branchName };
  }

  async createOrUpdateCurrentProcess(
    createDto: CreateCurrentProcessStateDto | UpdateCurrentProcessStateDto,
    projectId: string,
    queryRunner: EntityManager,
    id?: string,
  ): Promise<CurrentProcessState> {
    try {
      const currentProcessState = new CurrentProcessState();
      if (id) {
        currentProcessState.id = id;
      }
      currentProcessState.projectId = projectId;
      currentProcessState.name = createDto.name;
      await queryRunner.save(CurrentProcessState, currentProcessState);
      return currentProcessState;
    } catch (error) {
      Logger.error(error, 'Error -> saveCurrentProcess');
      throw new BadRequestException(error);
    }
  }

  async createAssociatedProcess(
    currentProcessState: CurrentProcessState,
    associatedProcessState: CurrentProcessState,
    queryRunner: EntityManager,
  ): Promise<AssociatedProcess> {
    try {
      const associatedProcess = new AssociatedProcess();
      associatedProcess.currentProcess = associatedProcessState;
      associatedProcess.associated = currentProcessState;
      await queryRunner.save(associatedProcess);

      return associatedProcess;
    } catch (error) {
      Logger.error(error, 'Error -> saveAssociatedProcess');
      throw new BadRequestException(error);
    }
  }

  async createAssociatedSpc(
    currentProcessState: CurrentProcessState,
    spcData: {
      id: string;
      name: string;
      code: string;
      visibleCode: string;
      branchName: string;
    },
    queryRunner: EntityManager,
  ): Promise<AssociatedSpc> {
    const associatedSpc = new AssociatedSpc();
    associatedSpc.spcId = spcData.id;
    associatedSpc.name = spcData.name;
    associatedSpc.code = spcData.code;
    associatedSpc.visibleCode = spcData.visibleCode;
    associatedSpc.branchName = spcData.branchName;
    associatedSpc.currentProcess = currentProcessState;
    await queryRunner.save(associatedSpc);

    return associatedSpc;
  }

  async filter(
    projectId: string,
    filter: CurrentProcessFilter,
    sorting: CurrentProcessSorting,
    pagination: Pagination,
  ): Promise<any> {
    const queryBuilder = this.findCurrentProcessbyProject(projectId);

    FilterService.applyFilters(queryBuilder, filter);
    this.applySorting(queryBuilder, sorting);
    return await this.paginate(queryBuilder, pagination);
  }

  async findCurrentProcessForRequestCapturing(
    projectId: string,
  ): Promise<TreeNode[]> {
    return await this.getCurrentProcess(projectId);
  }

  async getCurrentProcess(
    projectId: string,
    parent: CurrentProcessState | null = null,
  ): Promise<TreeNode[]> {
    const queryBuilder = this.currentRepository
      .createQueryBuilder('currentProcess')
      .leftJoinAndSelect(
        'currentProcess.associatedProcesses',
        'associatedProcesses',
      )
      .where('currentProcess.project_id = :projectId', { projectId });
    if (parent) {
      queryBuilder.andWhere('associatedProcesses.currentProcess = :parentId', {
        parentId: parent.id,
      });
    } else {
      queryBuilder.andWhere('associatedProcesses.id IS NULL');
    }
    const currentProcessList = await queryBuilder.getMany();

    const tree: TreeNode[] = [];
    for (const currentProcess of currentProcessList) {
      const presentation =
        await this.getPresentationForCurrentProcess(currentProcess);

      const treeNode: TreeNode = {
        id: currentProcess.id,
        name: currentProcess.name,
        presentationId: presentation
          ? presentation.currentProcessState.id
          : null,
      };

      const children = await this.getCurrentProcess(projectId, currentProcess);
      if (children.length > 0) {
        treeNode.subProcesses = children;
      }

      tree.push(treeNode);
    }
    return tree;
  }

  private async getPresentationForCurrentProcess(
    currentProcess: CurrentProcessState,
  ): Promise<CurrentProcessPresentation | null> {
    if (currentProcess.status === CurrentProcessStatus.NotStarted) {
      return null;
    }

    return this.currentProcessPresentationRepository.findOne({
      where: { currentProcessState: { id: currentProcess.id } },
      relations: ['currentProcessState'],
      order: { createdAt: 'DESC' },
    });
  }

  private findCurrentProcessbyProject(projectId: string) {
    return this.currentRepository
      .createQueryBuilder('currentProcess')
      .leftJoinAndSelect(
        'currentProcess.associatedProcesses',
        'associatedProcesses',
      )
      .leftJoinAndSelect('associatedProcesses.currentProcess', 'associated')
      .leftJoinAndSelect('currentProcess.associatedSpcs', 'associatedSpcs')
      .where('currentProcess.project_id = :projectId', { projectId });
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<any>,
    sorting: CurrentProcessSorting,
  ): void {
    const { status, currentProcess, spcBranch, updatedAt } = sorting;
    if (status) {
      queryBuilder.addOrderBy('currentProcess.status', status);
    }
    if (currentProcess) {
      queryBuilder.addOrderBy('currentProcess.name', currentProcess);
    }
    if (spcBranch) {
      queryBuilder.addOrderBy('associatedSpcs.branchName', spcBranch);
    }
    if (updatedAt) {
      queryBuilder.addOrderBy('currentProcess.updatedAt', updatedAt);
    }
  }

  async findOne(projectId: string, id: string) {
    const queryBuilder = this.findCurrentProcessbyProject(projectId);
    const currentProcess = await queryBuilder
      .andWhere('currentProcess.id = :id', { id })
      .getOne();

    if (!currentProcess) {
      throw new NotFoundException('Current process not found');
    }
    return currentProcess;
  }

  async update(
    id: string,
    data: UpdateCurrentProcessStateDto,
    projectId: string,
    token: string,
  ) {
    await this.validateCurrentProcessName(data.name, projectId, id);

    const validateSpc = await this.validateSpc(token, data.spcsId);
    try {
      const currentProcess = await this.currentRepository.findOneBy({
        id: id,
        projectId: projectId,
      });
      if (!currentProcess) {
        throw new NotFoundException('CurrentProcess not found');
      }
      await this.currentRepository.manager.transaction(async (manager) => {
        const newCurrentProcess = await this.createOrUpdateCurrentProcess(
          data,
          projectId,
          manager,
          id,
        );
        const currentProcess =
          await this.findAllAssociatedCurrentProcessesAndSpcs(id);

        for (const associated of currentProcess.associatedProcesses) {
          await manager.softDelete(AssociatedProcess, {
            currentProcess: associated,
            associated: newCurrentProcess,
          });
        }
        if (data.associatesId) {
          await this.validateAssociateSubprocess(
            projectId,
            id,
            data.associatesId,
          );
          const associatedProcess = await manager
            .getRepository(CurrentProcessState)
            .findOneBy({
              id: data.associatesId,
              projectId: projectId,
            });

          let isAssociated = null;
          if (associatedProcess) {
            isAssociated = await manager
              .getRepository(AssociatedProcess)
              .findOneBy({
                currentProcess: { id: associatedProcess.id },
                associated: { id: newCurrentProcess.id },
              });
          }
          if (!isAssociated) {
            await this.createAssociatedProcess(
              newCurrentProcess,
              associatedProcess,
              manager,
            );
          }
        }

        for (const spc of currentProcess.spcs) {
          if (!data.spcsId.includes(spc.spcId)) {
            await manager.softDelete(AssociatedSpc, {
              currentProcess: newCurrentProcess,
            });
          }
        }
        if (data.spcsId) {
          await manager.softDelete(AssociatedSpc, {
            currentProcess: newCurrentProcess,
          });
        }

        const associatedSpc = await manager
          .getRepository(AssociatedSpc)
          .findOneBy({
            id: validateSpc.id,
            currentProcess: { id: newCurrentProcess.id },
          });
        if (!associatedSpc)
          await this.createAssociatedSpc(
            newCurrentProcess,
            validateSpc,
            manager,
          );
      });

      const queryBuilder = this.findCurrentProcessbyProject(projectId);
      return queryBuilder.andWhere({ id: id }).getOne();
    } catch (error) {
      Logger.error(error, 'Error -> update Current Process');
      throw new BadRequestException(error);
    }
  }

  private async validateAssociateSubprocess(
    projectId: string,
    parentId: string,
    associatesId: string,
  ) {
    const currentProcessTreeNode = await this.getCurrentProcess(projectId);
    const parentProcess = this.findItemById(currentProcessTreeNode, parentId);
    if (parentProcess) {
      this.validateSubprocessRecursively(parentProcess, associatesId);
    }
    return null;
  }

  private validateSubprocessRecursively(process: any, associatesId: string) {
    if (process.subProcesses) {
      for (const subProcess of process.subProcesses) {
        if (subProcess.id === associatesId) {
          throw new ConflictException(
            'The associated current process is already in use',
          );
        }
        if (subProcess.subProcesses) {
          this.validateSubprocessRecursively(subProcess, associatesId);
        }
      }
    }
  }
  private findItemById(tree: any[], id: string): any | null {
    for (const item of tree) {
      if (item.id === id) {
        return item;
      }
      if (item.subProcesses) {
        const found = this.findItemById(item.subProcesses, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
  async findAllAssociatedCurrentProcessesAndSpcs(
    currentProcessStateId: string,
  ): Promise<{
    associatedProcesses: CurrentProcessState[];
    spcs: AssociatedSpc[];
  }> {
    const associatedProcesses = await this.associatedRepository.find({
      where: {
        associated: { id: currentProcessStateId },
      },
      relations: ['currentProcess'],
    });
    const associatedCurrentProcessStates = associatedProcesses.map(
      (ap) => ap.currentProcess,
    );
    const associatedSpcs = await this.spcRepository.find({
      where: {
        currentProcess: { id: currentProcessStateId },
      },
    });
    return {
      associatedProcesses: associatedCurrentProcessStates,
      spcs: associatedSpcs,
    };
  }

  async remove(id: string, projectId: string) {
    await this.currentRepository.manager.transaction(async (manager) => {
      const currentProcessToDelete = await manager.findOneBy(
        CurrentProcessState,
        { id, projectId },
      );
      if (!currentProcessToDelete) {
        throw new NotFoundException('CurrentProcessState not found');
      }
      const parent = await this.associatedRepository.findOne({
        where: {
          currentProcess: { id },
        },
        relations: ['associated'],
      });

      if (parent) {
        const { associatedProcesses } =
          await this.findAllAssociatedCurrentProcessesAndSpcs(id);
        for (const associatedProcess of associatedProcesses) {
          await this.createAssociatedProcess(
            parent.associated,
            associatedProcess,
            manager,
          );
        }
      }
      await manager.softDelete(TemplateBlock, {
        currentProcessPresentation: { id },
      });

      await manager.softDelete(AssociatedProcess, {
        currentProcess: { id },
      });

      await manager.softDelete(AssociatedSpc, {
        currentProcess: { id },
      });

      return await manager.softDelete(CurrentProcessState, {
        id,
      });
    });
  }
}
