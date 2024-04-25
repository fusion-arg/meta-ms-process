import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrentProcessStateDto } from './create-current-process-state.dto';

export class UpdateCurrentProcessStateDto extends PartialType(
  CreateCurrentProcessStateDto,
) {}
