import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FutureProcessState } from './entities/future-process-state.entity';
import { PresentationDto } from './dto/presentation.dto';
import { TextTemplateBlock } from './entities/text-template-block.entity';
import { CurrentProcessPresentation } from './entities/current-process-presentation.entity';
import { CurrentProcessPresentationDto } from 'src/modules/presentation/dto/current-process-presentation.dto';

@Injectable()
export class TextTemplateService {
  constructor(
    @InjectRepository(TextTemplateBlock)
    private textTemplateBlockRepository: Repository<TextTemplateBlock>,
  ) {}

  async createFutureProcessTextTemplate(
    process: FutureProcessState,
    item: PresentationDto,
  ): Promise<void> {
    const template = this.textTemplateBlockRepository.create({
      step: item.step,
      title: item.title,
      comments: item.comment,
      description: item.text,
      futureProcessState: process,
    }) as TextTemplateBlock;

    await this.setReference(item, template);
    await this.textTemplateBlockRepository.save(template);
  }

  async createCurrentProcessTextTemplate(
    process: CurrentProcessPresentation,
    item: CurrentProcessPresentationDto,
  ): Promise<void> {
    const template = this.textTemplateBlockRepository.create({
      step: item.step,
      title: item.title,
      comments: item.comment,
      description: item.text,
      currentProcessPresentation: process,
      processTitle: item.processTitle,
    }) as TextTemplateBlock;

    await this.setReference(item, template);
    await this.textTemplateBlockRepository.save(template);
  }

  private async setReference(
    item: PresentationDto,
    template: TextTemplateBlock,
  ) {
    if (item.stepId) {
      const templateBlock = await this.textTemplateBlockRepository.findOne({
        where: { id: item.stepId },
        relations: ['referenceId'],
      });
      template.referenceId = templateBlock.referenceId;
    } else {
      template.referenceId = template;
    }
  }
}
