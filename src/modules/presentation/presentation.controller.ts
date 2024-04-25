import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PresentationService } from './presentation.service';
import { PresentationDraftImageDto } from './dto/presentation-draft-image.dto';

@Controller('projects/:projectId/presentations')
export class PresentationController {
  constructor(private presentations: PresentationService) {}

  @Post(':id/draft-images')
  @UseGuards()
  @HttpCode(HttpStatus.CREATED)
  async createDraftImages(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() body: PresentationDraftImageDto,
  ) {
    await this.presentations.createDraftImages(projectId, id, body);
  }

  @Get(':id/draft-images')
  @UseGuards()
  async findPresentation(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    const items = await this.presentations.getDraftImages(projectId, id);
    return {
      data: items,
    };
  }

  @Delete(':id/draft-images')
  @UseGuards()
  @HttpCode(HttpStatus.CREATED)
  async deleteDraftImages(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    await this.presentations.deleteDraftImages(projectId, id);
  }
}
