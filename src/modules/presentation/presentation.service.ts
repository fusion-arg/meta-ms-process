import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '../../helpers/services/pagination.service';
import { FutureProcessState } from './entities/future-process-state.entity';
import { PresentationDto } from './dto/presentation.dto';
import { SelectedFutureProcessService } from '../selected-future-process/selected-future-process.service';
import { TextTemplateService } from './text-template.service';
import { ImageTemplateService } from './image-template.service';
import { TemplateBlock } from './entities/template-block.entity';
import { ImageTemplateBlock } from './entities/image-template-block.entity';
import { TextTemplateBlock } from './entities/text-template-block.entity';
import { MinioStorageService } from '../file-storage/minion-storage.service';
import { ConfigService } from '@nestjs/config';
import { PresentationType } from '../../enum/presentation-type';
import { ApiProjectService } from '../../api-service/api-project.service';
import { FutureProcessData } from '../../data/api-project/future-process.data';
import {
  SelectedFutureProcessStatus,
  FutureProcessStatusList,
} from '../../enum/selected-future-process-status';
import { CurrentProcessState } from '../current-process-state/entities/current-process-state.entity';
import {
  CurrentProcessStatus,
  CurrentProcessStatusList,
  getCurrentProcessStatusById,
} from '../../enum/current-process-status';
import { CurrentProcessPresentation } from './entities/current-process-presentation.entity';
import { PresentationDraftImageDto } from './dto/presentation-draft-image.dto';
import { PresentationDraftImage } from './entities/presentation-draft-image.entity';
import { FileStorage } from '../file-storage/entities/file-storage.entity';
import { CurrentProcessPresentationDto } from 'src/modules/presentation/dto/current-process-presentation.dto';

interface PresentationResponse {
  effectiveId: string;
  steps: PresentationItem[];
}
interface PresentationItem {
  id: string;
  comments: string;
  title: string;
  step: number;
  type: PresentationType.image | PresentationType.text;
  image?: Image;
  description?: string;
  imageData?: string;
  processTitle: string;
}

interface Image {
  url: string;
  id: string;
}

@Injectable()
export class PresentationService extends PaginationService {
  constructor(
    @InjectRepository(TemplateBlock)
    private templateBlockRepository: Repository<TemplateBlock>,
    @InjectRepository(FutureProcessState)
    private futureProcessRepository: Repository<FutureProcessState>,
    @InjectRepository(CurrentProcessState)
    private currentProcessRepository: Repository<CurrentProcessState>,
    @InjectRepository(CurrentProcessPresentation)
    private currentProcessPresentationRepository: Repository<CurrentProcessPresentation>,
    @Inject(SelectedFutureProcessService)
    private readonly selectedFutureProcess: SelectedFutureProcessService,
    private readonly imageTemplateService: ImageTemplateService,
    private readonly textTemplateService: TextTemplateService,
    private readonly fileStorageService: MinioStorageService,
    private readonly apiProjectService: ApiProjectService,
    private configService: ConfigService,
    @InjectRepository(PresentationDraftImage)
    private presentationDraftImageRepository: Repository<PresentationDraftImage>,
  ) {
    super();
  }
  async createFutureProcessPresentation(
    projectId: string,
    processId: string,
    data: PresentationDto[],
    token: string,
    createdBy: string,
  ) {
    const selectedFutureProcess = await this.selectedFutureProcess.findOne(
      processId,
      projectId,
    );

    const futureProcessState = await this.createFutureProcessState(
      selectedFutureProcess,
      createdBy,
    );

    const itemsToAdd = this.removeDeletedAndAddStep(data);
    await this.addSteptsToFutureProcessPresentation(
      itemsToAdd,
      futureProcessState,
    );

    const futureProcessUnselected: FutureProcessData = {
      id: selectedFutureProcess.futureProcessId,
    };
    await this.apiProjectService.unSelectedFutureProcess(
      projectId,
      futureProcessUnselected,
      token,
    );
  }

  private async createFutureProcessState(
    selectedFutureProcess: any,
    createdBy: string,
  ) {
    const newFutureProcessState = this.futureProcessRepository.create({
      createdBy,
      selectedFutureProcess,
    });

    const futureProcessState = await this.futureProcessRepository.save(
      newFutureProcessState,
    );
    return futureProcessState;
  }

  private async createCurrentProcessPresentation(
    currentProcess: CurrentProcessState,
    createdBy: string,
  ) {
    const newPresentation = this.currentProcessPresentationRepository.create({
      createdBy,
      currentProcessState: currentProcess,
    });

    const currentProcessPresentation =
      await this.currentProcessPresentationRepository.save(newPresentation);
    return currentProcessPresentation;
  }

  private async addSteptsToFutureProcessPresentation(
    itemsToAdd: PresentationDto[],
    futureProcessState: FutureProcessState,
  ) {
    for (const item of itemsToAdd) {
      if (item.type === PresentationType.image) {
        await this.imageTemplateService.createFutureProcessImageTemplate(
          futureProcessState,
          item,
        );
      } else if (item.type === PresentationType.text) {
        await this.textTemplateService.createFutureProcessTextTemplate(
          futureProcessState,
          item,
        );
      }
    }
  }

  async resetCurrentProcessPresentation(
    projectId: string,
    processId: string,
    createdBy: string,
  ) {
    const processState = await this.currentProcessRepository.findOne({
      where: { projectId: projectId, id: processId },
    });

    await this.createCurrentProcessPresentation(processState, createdBy);
    const currentProcessStatusId = CurrentProcessStatusList.find(
      (status) => status.name === CurrentProcessStatus.InProcess,
    )?.id;
    await this.changeStatus(
      processId,
      currentProcessStatusId.toString(),
      projectId,
    );
  }

  async resetFutureProcessPresentation(
    projectId: string,
    processId: string,
    createdBy: string,
  ) {
    const selectedFutureProcess = await this.selectedFutureProcess.findOne(
      processId,
      projectId,
    );

    await this.createFutureProcessState(selectedFutureProcess, createdBy);
    const futureProcessStatusId = FutureProcessStatusList.find(
      (status) => status.name === SelectedFutureProcessStatus.InProcess,
    )?.id;
    await this.selectedFutureProcess.changeStatus(
      processId,
      futureProcessStatusId.toString(),
      projectId,
    );
  }

  async findFutureProcessPresentation(
    projectId: string,
    processId: string,
  ): Promise<PresentationResponse> {
    const selectedFutureProcess = await this.selectedFutureProcess.findOne(
      processId,
      projectId,
    );
    const latestSelectedFutureProcess =
      await this.futureProcessRepository.findOne({
        where: { selectedFutureProcess: { id: processId } },
        order: { createdAt: 'DESC' },
      });

    if (!latestSelectedFutureProcess) {
      return { effectiveId: selectedFutureProcess.id, steps: [] };
    }
    const templates = await this.templateBlockRepository.find({
      where: { futureProcessState: { id: latestSelectedFutureProcess.id } },
      relations: ['file'],
      order: { step: 'ASC' },
    });

    const presentation = await this.mapTemplatesToPresentationItems(templates);
    const response = {
      steps: presentation,
      effectiveId: latestSelectedFutureProcess.id,
    };
    return response;
  }

  async findCurrentProcessPresentation(
    projectId: string,
    processId: string,
  ): Promise<PresentationResponse> {
    const currentProcess = await this.currentProcessRepository.findOne({
      where: { id: processId, projectId },
    });
    const latestProcess =
      await this.currentProcessPresentationRepository.findOne({
        where: { currentProcessState: { id: processId } },
        order: { createdAt: 'DESC' },
      });

    if (!latestProcess) {
      return { effectiveId: currentProcess.id, steps: [] };
    }

    const templates = await this.templateBlockRepository.find({
      where: { currentProcessPresentation: { id: latestProcess.id } },
      relations: ['file'],
      order: { step: 'ASC' },
    });

    const presentation = await this.mapTemplatesToPresentationItems(templates);
    const response = {
      steps: presentation,
      effectiveId: latestProcess.id,
    };
    return response;
  }

  async mapTemplatesToPresentationItems(templates: TemplateBlock[]) {
    const urlExpiry =
      +this.configService.get<string>('MINIO_URL_EXPIRY') || null;

    const presentationItems: PresentationItem[] = [];
    for (const template of templates) {
      const step: PresentationItem = {
        id: template.id,
        comments: template.comments,
        title: template.title,
        step: template.step,
        type: null,
        processTitle: template.processTitle,
      };
      if (template instanceof ImageTemplateBlock) {
        const fileStorage = template.file;
        step.type = PresentationType.image;
        const url = await this.fileStorageService.getPresignedUrl(
          fileStorage.bucketName,
          fileStorage.filename,
          urlExpiry,
        );
        const image: Image = {
          id: fileStorage.id,
          url,
        };
        step.image = image;
        step.imageData = JSON.stringify(template.imageData);
      } else if (template instanceof TextTemplateBlock) {
        step.type = PresentationType.text;
        step.description = template.description;
      }
      presentationItems.push(step);
    }
    return presentationItems;
  }

  async createCurrentProcessStatePresentation(
    projectId: string,
    processId: string,
    data: CurrentProcessPresentationDto[],
    createdBy: string,
  ) {
    const currentProcessState = await this.currentProcessRepository.findOne({
      where: { projectId: projectId, id: processId },
    });
    if (!currentProcessState) {
      throw new NotFoundException('Current process not found');
    }
    const currentProcessPresentation =
      await this.createCurrentProcessPresentation(
        currentProcessState,
        createdBy,
      );

    const itemsToAdd = this.removeDeletedAndAddStep(data);
    await this.addSteptsToCurrentProcessPresentation(
      itemsToAdd,
      currentProcessPresentation,
    );
  }

  async createDraftImages(
    projectId: string,
    presentationId: string,
    data: PresentationDraftImageDto,
  ) {
    await this.presentationDraftImageRepository.manager.transaction(
      async (manager) => {
        const images = [];
        for (const item of data.images) {
          const file = await manager
            .getRepository(FileStorage)
            .findOneOrFail({ where: { id: item } });
          const image = new PresentationDraftImage();

          image.projectId = projectId;
          image.presentationId = presentationId;
          image.file = file;

          images.push(image);
        }
        await manager.save(images);
      },
    );
  }

  async getDraftImages(projectId: string, presentationId: string) {
    const items = await this.presentationDraftImageRepository.find({
      where: { projectId, presentationId },
      relations: ['file'],
    });
    const response = [];

    for (const item of items) {
      response.push({
        id: item.file.id,
        url: await this.fileStorageService.getPresignedUrl(
          item.file.bucketName,
          item.file.filename,
          +this.configService.get<string>('MINIO_URL_EXPIRY'),
        ),
      });
    }

    return response;
  }

  async deleteDraftImages(projectId: string, presentationId: string) {
    await this.presentationDraftImageRepository
      .createQueryBuilder()
      .delete()
      .where('projectId = :projectId', { projectId })
      .andWhere('presentationId = :presentationId', { presentationId })
      .execute();
  }

  private async addSteptsToCurrentProcessPresentation(
    itemsToAdd: CurrentProcessPresentationDto[],
    currentProcessPresentation: CurrentProcessPresentation,
  ) {
    for (const item of itemsToAdd) {
      if (item.type === PresentationType.image) {
        await this.imageTemplateService.createCurrentProcessImageTemplate(
          currentProcessPresentation,
          item,
        );
      } else if (item.type === PresentationType.text) {
        await this.textTemplateService.createCurrentProcessTextTemplate(
          currentProcessPresentation,
          item,
        );
      }
    }
  }

  private removeDeletedAndAddStep(data: PresentationDto[]) {
    const items = data.filter((item) => !item.deleted);
    const newData = items.map((item, index) => ({
      ...item,
      step: index + 1,
    }));
    return newData;
  }

  async changeStatus(id: string, status: string, projectId: string) {
    const newStatus = getCurrentProcessStatusById(status);
    if (!newStatus) {
      throw new BadRequestException('Invalid status');
    }

    const currentProcessProcess = await this.currentProcessRepository.findOne({
      where: { id, projectId },
    });

    if (!currentProcessProcess) {
      throw new NotFoundException('Current process not found');
    }

    // TODO: Status flow validation
    Object.assign(currentProcessProcess, {
      status: newStatus,
    });

    return this.currentProcessRepository.save(currentProcessProcess);
  }
}
