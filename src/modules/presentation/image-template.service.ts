import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FutureProcessState } from './entities/future-process-state.entity';
import { PresentationDto } from './dto/presentation.dto';
import { ImageTemplateBlock } from './entities/image-template-block.entity';
import { FileStorage } from '../file-storage/entities/file-storage.entity';
import { CurrentProcessPresentation } from './entities/current-process-presentation.entity';
import { CurrentProcessPresentationDto } from 'src/modules/presentation/dto/current-process-presentation.dto';

@Injectable()
export class ImageTemplateService {
  constructor(
    @InjectRepository(FileStorage)
    private fileStorageRepository: Repository<FileStorage>,
    @InjectRepository(ImageTemplateBlock)
    private imageTemplateBlockRepository: Repository<ImageTemplateBlock>,
  ) {}

  async createFutureProcessImageTemplate(
    process: FutureProcessState,
    item: PresentationDto,
  ): Promise<void> {
    const image = await this.getImageById(item.imageId);

    const template = this.imageTemplateBlockRepository.create({
      step: item.step,
      title: item.title,
      comments: item.comment,
      file: image,
      imageData: item.imageData,
      futureProcessState: process,
    }) as ImageTemplateBlock;

    await this.setReference(item, template);
    await this.imageTemplateBlockRepository.save(template);
  }

  private async setReference(
    item: PresentationDto,
    template: ImageTemplateBlock,
  ) {
    if (item.stepId) {
      const templateBlock = await this.imageTemplateBlockRepository.findOne({
        where: { id: item.stepId },
        relations: ['referenceId'],
      });
      template.referenceId = templateBlock.referenceId;
    } else {
      template.referenceId = template;
    }
  }

  async createCurrentProcessImageTemplate(
    process: CurrentProcessPresentation,
    item: CurrentProcessPresentationDto,
  ): Promise<void> {
    const image = await this.getImageById(item.imageId);

    const template = this.imageTemplateBlockRepository.create({
      step: item.step,
      title: item.title,
      comments: item.comment,
      file: image,
      imageData: item.imageData,
      currentProcessPresentation: process,
      processTitle: item.processTitle,
    }) as ImageTemplateBlock;

    await this.setReference(item, template);
    await this.imageTemplateBlockRepository.save(template);
  }

  private async getImageById(id: string): Promise<FileStorage> {
    const image = await this.fileStorageRepository.findOne({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException('File not found');
    }
    return image;
  }
}
