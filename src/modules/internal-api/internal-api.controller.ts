import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { InternalApiService } from './internal-api.service';
import { ProcessForTextBlockDto } from './dto/process-for-text-block.dto';

@Controller('internal-apis')
export class InternalApiController {
  constructor(private readonly internalApis: InternalApiService) {}

  @Post('processes-for-text-blocks')
  @HttpCode(HttpStatus.OK)
  async processesForTextBlocks(@Body() data: ProcessForTextBlockDto) {
    return await this.internalApis.processesForTextBlocks(data);
  }
}
