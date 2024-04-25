import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiProjectService } from './api-project.service';
import { ApiOrganizationService } from './api-organization.service';
import { ApiSurveyService } from 'src/api-service/api-survey.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        timeout: 5000,
        maxRedirects: 5,
        headers: {
          'Response-Content-Type': 'json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ApiProjectService, ApiOrganizationService, ApiSurveyService],
  exports: [ApiProjectService, ApiOrganizationService, ApiSurveyService],
})
export class ApiServiceModule {}
