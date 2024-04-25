import { BadRequestException, Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { plainToClass } from 'class-transformer';
import { ValidationError, validateOrReject } from 'class-validator';
import {
  ProcessMappingDto,
  ProcessMappingItem,
} from './dto/process-mapping.dto';
import { ProcessMappingCsvHeaderDto } from './dto/process-mapping-header.dto';

@Injectable()
export class ProcessMappingUploadFileService {
  constructor() {}

  async processFile(file: Express.Multer.File): Promise<ProcessMappingDto> {
    if (
      !file ||
      !file.buffer ||
      file.mimetype !== 'text/csv' ||
      file.size === 0
    ) {
      throw new BadRequestException('No valid file provided');
    }
    await this.validateHeaderCsvFile(file);
    const processMapping: ProcessMappingDto = await this.parseCsvFile(file);
    return processMapping;
  }

  private async validateHeaderCsvFile(
    file: Express.Multer.File,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const stream = csvParser({ headers: false });

      let csvRecord: string[] | undefined;

      stream.on('data', async (record) => {
        csvRecord = record;
        stream.pause();
      });

      stream.on('pause', async () => {
        try {
          const csvHeaderDto = plainToClass(ProcessMappingCsvHeaderDto, {});
          csvHeaderDto.processId = csvRecord[0];
          csvHeaderDto.departmentId = csvRecord[1];

          await validateOrReject(csvHeaderDto);
          resolve();
        } catch (validationErrors) {
          const errorMessages = validationErrors.map(
            (error: ValidationError) => {
              return Object.values(error.constraints).join(', ');
            },
          );

          reject(
            new BadRequestException(
              `The file header does not match the expected fields. Details: ${errorMessages}`,
            ),
          );
        }
      });
      stream.write(file.buffer);
      stream.end();
    });
  }

  private parseCsvFile(file: Express.Multer.File): Promise<ProcessMappingDto> {
    return new Promise(async (resolve, reject) => {
      const processMappingFile: ProcessMappingDto = {
        file: file.originalname,
        branchCodes: [],
        departmentCodes: [],
        items: [],
        hasErrors: false,
      };
      let row = 1;
      const stream = csvParser({ headers: false, skipLines: 1 }).on(
        'data',
        (csvRecord) => {
          const item = plainToClass(ProcessMappingItem, {
            row,
            branchCode: csvRecord[0] || '',
            deparmentCode: csvRecord[1],
            deparmentId: null,
            errors: [],
          });
          processMappingFile.branchCodes.push(item.branchCode);
          processMappingFile.departmentCodes.push(item.deparmentCode);
          processMappingFile.items.push(item);
          row++;
        },
      );
      stream.write(file.buffer);
      stream.end();
      stream.on('end', () => {
        if (processMappingFile.items.length === 0) {
          reject(new BadRequestException('Empty file'));
        }
        resolve(processMappingFile);
      });
    });
  }
}
